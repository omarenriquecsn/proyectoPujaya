import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { FirebaseAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/types/roles';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.PREMIUM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new auction' })
  @ApiResponse({ status: 201, description: 'Auction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not premium' })
  create(@Body() createAuctionDto: CreateAuctionDto, @Req() req) {
    return this.auctionsService.create(createAuctionDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all auctions' })
  @ApiResponse({ status: 200, description: 'List of auctions' })
  findAll(
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('seller') sellerId?: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius: number = 10, // default 10 km
  ) {
    return this.auctionsService.findAll(
      limit,
      page,
      search,
      category,
      sort,
      sellerId,
      lat,
      lng,
      radius,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get auction by ID' })
  @ApiResponse({ status: 200, description: 'Auction details' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.PREMIUM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an auction' })
  @ApiResponse({ status: 200, description: 'Auction updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner or not premium',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @Req() req,
  ) {
    return this.auctionsService.update(id, updateAuctionDto, req.user);
  }

  @Post(':id/products/:productId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.PREMIUM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a product to an auction' })
  @ApiResponse({ status: 200, description: 'Product added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner or not premium',
  })
  addProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req,
  ) {
    return this.auctionsService.addProduct(id, productId, req.user);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.PREMIUM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an auction' })
  @ApiResponse({ status: 200, description: 'Auction deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner or not premium',
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    console.log('id', id);
    console.log('req.user', req.user);
    return this.auctionsService.remove(id, req.user);
  }

  @Delete('forAdmin/:id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an auction for admin' })
  @ApiResponse({ status: 200, description: 'Auction deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not admin',
  })
  removeForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.removeForAdmin(id);
  }

  @Get('user/:userId')
  @UseGuards(FirebaseAuthGuard)
  async getUserAuctions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('status') status?: string,
  ) {
    // Puedes implementar la lógica en el service para filtrar por status
    return this.auctionsService.findByUserAndStatus(userId, status);
  }
}
