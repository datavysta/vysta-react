import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { ProductService } from '../services/ProductService';
import { CustomerService } from '../services/CustomerService';
import { OrderService } from '../services/OrderService';
import { SupplierService } from '../services/SupplierService';
import { NorthwindFileService } from '../services/NorthwindFileService';
import { TimezoneService } from '../../../src/services/TimezoneService';
import { Loader, Flex } from '@mantine/core';

// Extend IServiceContext for this app
export interface AppServiceContext {
  productService: ProductService;
  customerService: CustomerService;
  orderService: OrderService;
  supplierService: SupplierService;
  fileService: NorthwindFileService;
  timezoneService: TimezoneService;
  client: VystaClient;
}

const ServicesContext = createContext<AppServiceContext | null>(null);

interface ServicesProviderProps {
  client: VystaClient;
  children: ReactNode;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ client, children }) => {
  const [services, setServices] = useState<AppServiceContext | null>(null);

  useEffect(() => {
    // Construct all services here (sync, but could be async in real apps)
    setServices({
      productService: new ProductService(client),
      customerService: new CustomerService(client),
      orderService: new OrderService(client),
      supplierService: new SupplierService(client),
      fileService: new NorthwindFileService(client),
      timezoneService: new TimezoneService('http://localhost:8080'),
      client,
    });
  }, [client]);

  if (!services) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

// Hook for consuming services
export function useServices(): AppServiceContext {
  const ctx = useContext(ServicesContext);
  if (!ctx) {
    throw new Error('useServices must be used within a ServicesProvider or services are not yet initialized');
  }
  return ctx;
}            