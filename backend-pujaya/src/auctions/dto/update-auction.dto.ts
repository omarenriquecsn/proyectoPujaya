import { PartialType } from '@nestjs/swagger';
import { CreateAuctionDto } from './create-auction.dto';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {
  // No cambios necesarios, PartialType ya incluye latitude y longitude como opcionales para la actualización.
}
