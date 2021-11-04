export interface UserRoOptions {
  readonly numberOfWishlists?: boolean;
  readonly numberOfFriends?: boolean;
}

export interface UserRo {
  readonly userId: number;
  readonly username: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly birthdayDate: string;
  readonly numberOfWishlists?: number;
  readonly numberOfFriends?: number;
}
