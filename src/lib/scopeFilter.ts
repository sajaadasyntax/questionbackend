import { JwtPayload } from '../middleware/auth';

/**
 * Build a Prisma `where` clause fragment that scopes households to the
 * authenticated user's administrative boundary.
 */
export function buildScopeWhere(user: JwtPayload): Record<string, unknown> {
  switch (user.role) {
    case 'LOCALITY_MANAGER':
      if (user.scopeLocalityId) {
        return {
          neighborhood: {
            village: {
              administrativeUnit: { localityId: user.scopeLocalityId },
            },
          },
        };
      }
      return {};

    case 'ADMIN_UNIT_MANAGER':
      if (user.scopeAdminUnitId) {
        return {
          neighborhood: {
            village: { administrativeUnitId: user.scopeAdminUnitId },
          },
        };
      }
      return {};

    case 'VILLAGE_MANAGER':
      if (user.scopeVillageId) {
        return {
          neighborhood: { villageId: user.scopeVillageId },
        };
      }
      return {};

    case 'NEIGHBORHOOD_MANAGER':
      if (user.scopeNeighborhoodId) {
        return { neighborhoodId: user.scopeNeighborhoodId };
      }
      return {};

    default:
      return {};
  }
}
