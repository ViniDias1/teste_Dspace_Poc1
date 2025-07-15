// src/auth/auth.service.ts
import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../shared/entities/user.entity';
import { CreateUserDto } from '../shared/dtos/create-user.dto';
import { DSpaceService } from '../dspace/dspace.service'; // Importa o serviço do DSpace

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private dspaceService: DSpaceService, // Injeta o serviço do DSpace
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    const { email, password, firstName, lastName } = createUserDto;

    // 1. Verificar se o usuário já existe no seu DB
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // Inicia uma transação para garantir atomicidade

    try {
      // 2. Criar usuário no DSpace
      // A senha enviada aqui é a senha em texto claro fornecida pelo usuário,
      // pois o DSpace fará o hash internamente.
      const dspaceEpersonUuid = await this.dspaceService.createEperson(email, password, `${firstName} ${lastName}`);

      // 3. Hash da senha para o seu DB
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Criar usuário no seu DB
      const newUser = this.usersRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        dspaceEpersonUuid, // Salva o UUID do DSpace
        isActive: true,
      });

      await queryRunner.manager.save(User, newUser);
      await queryRunner.commitTransaction(); // Confirma a transação

      this.logger.log(`Usuário ${email} registrado com sucesso e sincronizado com DSpace.`);

      // 5. Gerar JWT
      const payload = { sub: newUser.id, email: newUser.email };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Reverte a transação em caso de erro
      this.logger.error(`Erro no registro/sincronização do usuário ${email}:`, error.message);

      // Se o erro foi na criação do DSpace, o DSpaceService já lançou uma InternalServerErrorException.
      // Se for outro erro (ex: banco de dados), relançamos ou tratamos.
      if (error instanceof InternalServerErrorException) {
          throw error;
      }
      throw new InternalServerErrorException('Falha ao registrar usuário.');
    } finally {
      await queryRunner.release(); // Libera o query runner
    }
  }

  // --- Exemplo de login (simplificado, sem DSpace para validação de login) ---
  // A validação de login é geralmente feita apenas contra seu DB.
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}