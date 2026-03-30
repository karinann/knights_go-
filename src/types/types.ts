// For storing all of user's clubs
export interface RoleWithClub {
  club: {
    id: number,
    club_name: string,
    description: string | null,
    category: string,
    logo_url: string | null
  }
  role: string
}

