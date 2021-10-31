export interface UserRoOptions {
  readonly numberOfWishlists?: boolean;
  readonly numberOfFriends?: boolean;
}

export interface UserRo {
  readonly userId: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly birthdayDate: string;
  readonly numberOfWishlists?: number;
  readonly numberOfFriends?: number;
}
