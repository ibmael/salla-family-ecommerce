import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MockCategoryRepository, MockProductRepository } from '../repositories/mock-catalog.repository';
import { MockAdminRepository, MockAuthRepository, MockOrderRepository } from '../repositories/mock-orders.repository';
import {
  ADMIN_REPOSITORY,
  AUTH_REPOSITORY,
  CATEGORY_REPOSITORY,
  ORDER_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../repositories/repository.tokens';

export function provideRepositories(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: PRODUCT_REPOSITORY, useExisting: MockProductRepository },
    { provide: CATEGORY_REPOSITORY, useExisting: MockCategoryRepository },
    { provide: ORDER_REPOSITORY, useExisting: MockOrderRepository },
    { provide: AUTH_REPOSITORY, useExisting: MockAuthRepository },
    { provide: ADMIN_REPOSITORY, useExisting: MockAdminRepository },
  ]);
}
