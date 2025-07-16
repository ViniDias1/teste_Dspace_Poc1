// src/auth/auth.service.ts
import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../shared/entities/user.entity';
import { CreateUserDto } from '../shared/dtos/create-user.dto';
import { DSpaceService } from '../dspace/dspace.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private dspaceService: DSpaceService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    const { email, password, firstName, lastName } = createUserDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const dspaceEpersonUuid = await this.dspaceService.createEperson(email, password, `${firstName} ${lastName}`);

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.usersRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        dspaceEpersonUuid,
        isActive: true,
      });

      await queryRunner.manager.save(User, newUser);
      await queryRunner.commitTransaction();

      this.logger.log(`Usuário ${email} registrado com sucesso e sincronizado com DSpace.`);

      const payload = { sub: newUser.id, email: newUser.email };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erro no registro/sincronização do usuário ${email}:`, error.message);


      if (error instanceof InternalServerErrorException) {
          throw error;
      }
      throw new InternalServerErrorException('Falha ao registrar usuário.');
    } finally {
      await queryRunner.release();
    }
  }

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