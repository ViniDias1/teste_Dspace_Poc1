// src/users/users.controller.ts
import { Controller, Get, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../shared/dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Você precisará implementar este guard
// import { RolesGuard } from '../auth/guards/roles.guard'; // Opcional: para controle de acesso por roles
// import { Roles } from '../auth/decorators/roles.decorator'; // Opcional: para decorar roles

@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller com JWT
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @UseGuards(RolesGuard) // Exemplo de uso de guard de roles
  // @Roles('admin') // Exemplo de role necessária
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}