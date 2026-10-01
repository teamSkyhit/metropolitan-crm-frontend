export interface UserLookup {
  id: string;
  name: string;
  role: string;
}

export interface UserLookupResponse {
  success: boolean;
  data: UserLookup[];
}
