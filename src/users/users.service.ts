// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../shared/entities/user.entity';
import { UpdateUserDto } from '../shared/dtos/update-user.dto';
import { DSpaceService } from '../dspace/dspace.service';

@Injectable()
export class UsersService {
  public readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dspaceService: DSpaceService,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password, firstName, lastName, isActive } = updateUserDto;
      const dspaceUpdates: { email?: string; name?: string; isActive?: boolean } = {};
      let nameChanged = false;

      // 1. Atualizar no seu DB
      if (email && email !== user.email) {
        const existingUserWithEmail = await queryRunner.manager.findOne(User, { where: { email } });
        if (existingUserWithEmail && existingUserWithEmail.id !== id) {
          throw new ConflictException('Este e-mail já está em uso por outro usuário.');
        }
        user.email = email;
        dspaceUpdates.email = email;
      }
      if (password) {
        user.password = await bcrypt.hash(password, 10);
        // ATENÇÃO: DSpace não permite atualização de senha via PATCH da mesma forma que email/name.
        // Se precisar atualizar senha no DSpace, você teria que usar um endpoint específico
        // ou criar um novo usuário e migrar o conteúdo (geralmente inviável).
        // Na maioria dos casos, a senha do DSpace é redefinida por lá, não pelo seu sistema.
      }
      if (firstName !== undefined) {
        user.firstName = firstName;
        nameChanged = true;
      }
      if (lastName !== undefined) {
        user.lastName = lastName;
        nameChanged = true;
      }
      if (isActive !== undefined) {
        user.isActive = isActive;
        dspaceUpdates.isActive = isActive;
      }

      if (nameChanged) {
          dspaceUpdates.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      }

      await queryRunner.manager.save(User, user);

      // 2. Atualizar no DSpace (se houver mudanças relevantes)
      if (Object.keys(dspaceUpdates).length > 0 && user.dspaceEpersonUuid) {
        await this.dspaceService.updateEperson(user.dspaceEpersonUuid, dspaceUpdates);
      } else if (Object.keys(dspaceUpdates).length > 0 && !user.dspaceEpersonUuid) {
          this.logger.warn(`Usuário ${user.id} tem atualizações para DSpace, mas não possui dspaceEpersonUuid.`);
      }

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Falha ao atualizar usuário: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // --- Exemplo de delete ---
  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (user.dspaceEpersonUuid) {
        await this.dspaceService.deleteEperson(user.dspaceEpersonUuid);
      } else {
        this.logger.warn(`Usuário ${id} não possui dspaceEpersonUuid para deletar no DSpace.`);
      }

      await queryRunner.manager.remove(User, user);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Falha ao deletar usuário: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // Outros métodos CRUD (findAll, findOne, etc.)
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}