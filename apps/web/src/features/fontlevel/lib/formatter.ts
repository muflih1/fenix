export function formatEmployeeRole(role: string) {
  switch(role) {
    case 'FRONT_OFFICE':
      return 'Front level'
      default:
        return role.toUpperCase()
  }
}
