import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje de contacto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Juan Pérez' },
        email: { type: 'string', example: 'juan@mail.com' },
        message: { type: 'string', example: 'Hola, tengo una duda...' }
      },
      required: ['name', 'email', 'message']
    }
  })
  @ApiResponse({ status: 201, description: 'Mensaje enviado correctamente' })
  async sendContact(
    @Body() body: { name: string; email: string; message: string },
  ) {
    await this.contactService.sendMail(body);
    return { message: 'Message sent successfully' };
  }
}
