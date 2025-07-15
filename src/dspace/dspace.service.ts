import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis de ambiente

@Injectable()
export class DSpaceService {
  private readonly logger = new Logger(DSpaceService.name);
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpirationTimeout: NodeJS.Timeout | null = null; // Para renovar o token

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.DSPACE_API_URL, // Ex: http://localhost:8080/server/api
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar o token de autorização
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (this.accessToken && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Interceptor para lidar com erros de autenticação (token expirado, inválido)
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.logger.warn('Token DSpace expirado ou inválido. Tentando reautenticar...');
          try {
            await this.authenticate();
            originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
            return this.axiosInstance(originalRequest); // Repete a requisição original
          } catch (authError) {
            this.logger.error('Falha na reautenticação com o DSpace:', authError.message);
            // Poderíamos relançar uma exceção mais específica ou cair para o erro original
          }
        }
        return Promise.reject(error);
      },
    );

    this.authenticate(); // Autentica no início da aplicação
  }

  private async authenticate(): Promise<void> {
    const adminEmail = process.env.DSPACE_ADMIN_EMAIL;
    const adminPassword = process.env.DSPACE_ADMIN_PASSWORD;
    console.log('DSpace Admin Email:', adminEmail);
    console.log('DSpace Admin Password:', adminPassword);
    if (!adminEmail || !adminPassword) {
      this.logger.error('Credenciais de administrador do DSpace não configuradas nas variáveis de ambiente.');
      throw new InternalServerErrorException('Credenciais de DSpace não configuradas.');
    }

    try {
      this.logger.debug('Tentando autenticar no DSpace...');
      const response = await this.axiosInstance.post('/authn/login', {
        email: adminEmail,
        password: adminPassword,
      });

      // DSpace 7 usa 'authentication-token' no header ou 'token' no body dependendo da configuração
      this.accessToken = response.headers['authentication-token'] || response.data.token;
      if (!this.accessToken) {
          throw new Error('Token de autenticação do DSpace não encontrado na resposta.');
      }
      this.logger.log('Autenticação no DSpace bem-sucedida.');

      // Opcional: Implementar renovação do token antes de expirar
      // DSpace 7 por padrão, o token expira em 30 minutos (1800 segundos)
      if (this.tokenExpirationTimeout) {
        clearTimeout(this.tokenExpirationTimeout);
      }
      // Renova 5 minutos antes de expirar, se o token tiver tempo de vida definido
      const expiresInSeconds = 1800; // Valor padrão do DSpace 7
      this.tokenExpirationTimeout = setTimeout(() => {
        this.logger.log('Renovando token DSpace...');
        this.authenticate();
      }, (expiresInSeconds - 300) * 1000); // 5 minutos antes da expiração
    } catch (error) {
      this.logger.error('Erro ao autenticar no DSpace:', error.response?.data || error.message);
      throw new UnauthorizedException('Falha na autenticação com o DSpace.');
    }
  }

  // --- Métodos de CRUD para ePersons no DSpace ---

  async createEperson(email: string, password: string, name: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post('/eperson/epersons', {
        email,
        password, // DSpace espera a senha em texto claro na criação
        name,
      });
      const epersonId = response.data.id; // DSpace 7 retorna o ID no body
      this.logger.log(`ePerson '${email}' criado no DSpace com ID: ${epersonId}`);
      return epersonId;
    } catch (error) {
      this.logger.error(`Erro ao criar ePerson '${email}' no DSpace:`, error.response?.data || error.message);
      throw new InternalServerErrorException(`Falha ao criar ePerson no DSpace: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateEperson(epersonId: string, updates: { email?: string; name?: string; isActive?: boolean }): Promise<void> {
    try {
      type PatchOperation = { op: 'replace'; path: string; value: string | boolean };
      const patchOperations: PatchOperation[] = [];
      if (updates.email !== undefined) {
        patchOperations.push({ op: 'replace', path: '/email', value: updates.email });
      }
      if (updates.name !== undefined) {
        patchOperations.push({ op: 'replace', path: '/name', value: updates.name });
      }
      if (updates.isActive !== undefined) {
          patchOperations.push({ op: 'replace', path: '/canLogIn', value: updates.isActive }); // 'canLogIn' controla a ativação
      }

      await this.axiosInstance.patch(`/eperson/epersons/${epersonId}`, patchOperations, {
        headers: { 'Content-Type': 'application/json-patch+json' }, // DSpace espera esse Content-Type para PATCH
      });
      this.logger.log(`ePerson '${epersonId}' atualizado no DSpace.`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar ePerson '${epersonId}' no DSpace:`, error.response?.data || error.message);
      throw new InternalServerErrorException(`Falha ao atualizar ePerson no DSpace: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteEperson(epersonId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/eperson/epersons/${epersonId}`);
      this.logger.log(`ePerson '${epersonId}' deletado do DSpace.`);
    } catch (error) {
      this.logger.error(`Erro ao deletar ePerson '${epersonId}' do DSpace:`, error.response?.data || error.message);
      throw new InternalServerErrorException(`Falha ao deletar ePerson do DSpace: ${error.response?.data?.message || error.message}`);
    }
  }

  // Você pode adicionar métodos para buscar ePersons, etc.
}