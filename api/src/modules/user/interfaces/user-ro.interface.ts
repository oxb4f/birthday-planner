export interface UserRoOptions {
  readonly numberOfWishlists?: boolean;
  readonly numberOfFriends?: boolean;
}

export interface UserRo {
  readonly userId: number;
  readonly username: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly birthdayDate: number;
  readonly avatar: string | null;
  readonly numberOfWishlists?: number;
  readonly numberOfFriends?: number;
}
