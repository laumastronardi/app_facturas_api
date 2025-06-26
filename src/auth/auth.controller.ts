import { Controller, Post, Body, HttpCode, HttpStatus, Get, UnauthorizedException } from '@nestjs/common';
import { Public } from './public.decorator';
import { CurrentUser } from './user.decorator';
import { UserResponse } from './entities/user.entity';
import { AuthService, LoginDto, SignUpDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto): Promise<UserResponse> {
    return this.authService.signup(signUpDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: UserResponse): UserResponse {
    if (!user) {
      throw new UnauthorizedException('No user found');
    }
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    // En JWT, el logout se maneja del lado del cliente
    // simplemente eliminando el token
    return { message: 'Logged out successfully' };
  }
} 