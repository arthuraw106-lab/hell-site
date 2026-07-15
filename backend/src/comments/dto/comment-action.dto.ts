import { IsIn, IsString, MaxLength } from 'class-validator';

export class VoteCommentDto {
  @IsIn([1, -1])
  value!: 1 | -1;
}

export class ReactCommentDto {
  @IsString()
  @MaxLength(16)
  emoji!: string;
}
