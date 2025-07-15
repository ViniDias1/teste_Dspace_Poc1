// src/auth/auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../shared/dtos/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard'; // Você precisará implementar este guard
import { Public } from './decorators/public.decorator'; // Um decorator para rotas públicas

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Marca a rota como pública (não requer JWT)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard) // Usa o guard local para login com email/senha
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    // 'req.user' é preenchido pelo LocalAuthGuard após validação
    return this.authService.login(req.user);
  }

  // Você pode ter um endpoint para revalidar token ou pegar perfil do usuário logado
  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}