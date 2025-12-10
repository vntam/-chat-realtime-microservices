import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getConversations(@Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }
      return await this.chatService.findConversationsByUser(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string, @Request() req) {
    try {
      return await this.chatService.findConversationById(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Conversation not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async createConversation(@Body() body: any, @Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const { participantIds, isGroup, name, avatar } = body;

      // Validate input
      if (!Array.isArray(participantIds) || participantIds.length === 0) {
        throw new HttpException(
          'participantIds must be a non-empty array',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert to numbers
      const participants = participantIds.map((id) => Number(id));

      const dto = {
        type: isGroup ? 'group' : 'private',
        participants,
        name: name || undefined,
        avatar: avatar || undefined,
      };

      return await this.chatService.createConversation(dto, userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create conversation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/messages')
  async getMessages(@Param('id') conversationId: string, @Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      return await this.chatService.getMessages(conversationId, userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch messages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('messages')
  async sendMessage(@Body() body: any, @Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      const { conversationId, content, attachments } = body;

      if (!conversationId || !content) {
        throw new HttpException(
          'conversationId and content are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const dto = {
        content,
        attachments: attachments || [],
      };

      return await this.chatService.sendMessage(conversationId, dto, userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteConversation(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      await this.chatService.deleteConversation(id, userId);
      return { message: 'Conversation deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete conversation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/accept')
  async acceptConversation(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }
      return await this.chatService.acceptMessageRequest(id, userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to accept conversation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
