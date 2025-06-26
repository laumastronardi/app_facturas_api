import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { User, UserResponse } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  email: string;
  password: string;
  name?: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<UserResponse> {
    const { email, password, name } = signUpDto;

    // Verificar si el usuario ya existe
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const { data: user, error } = await this.supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        name,
      }])
      .select('id, email, name, created_at, updated_at')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<{ user: UserResponse; access_token: string }> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar JWT token
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Retornar usuario sin password_hash
    const { password_hash, ...userResponse } = user;

    return {
      user: userResponse,
      access_token,
    };
  }

  async validateUser(userId: number): Promise<UserResponse> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('id, email, name, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
} 