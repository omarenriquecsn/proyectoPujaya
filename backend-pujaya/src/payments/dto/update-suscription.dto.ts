import { IsNotEmpty, IsString } from "class-validator";

export class UpdateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @IsString()
  @IsNotEmpty()
  plan: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

}