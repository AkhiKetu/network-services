export const CUSTOMER_PACKAGES = [
  { name: '8 Mbps', monthlyPrice: 500 },
  { name: '10 Mbps', monthlyPrice: 600 },
  { name: '15 Mbps', monthlyPrice: 700 },
  { name: '20 Mbps', monthlyPrice: 800 },
  { name: '25 Mbps', monthlyPrice: 1000 },
  { name: '30 Mbps', monthlyPrice: 1100 },
  { name: '40 Mbps', monthlyPrice: 1200 },
] as const

export const CUSTOMER_ZONES = [
  'HINDU PARA',
  'BORUYA PARA',
  'RINI ALAKA',
  'LICUBAGAN',
  'BABU PARA',
  'MADHYA RAJDWIP',
  'UTTARPARA',
  'RAJBARI',
] as const

export const CONNECTION_TYPES = ['PPPoE', 'Static', 'Dynamic'] as const

export function getCustomerPackage(name: string) {
  return CUSTOMER_PACKAGES.find(customerPackage => customerPackage.name === name)
}

export function isCustomerZone(zone: string) {
  return CUSTOMER_ZONES.includes(zone as (typeof CUSTOMER_ZONES)[number])
}

export function isConnectionType(connectionType: string) {
  return CONNECTION_TYPES.includes(
    connectionType as (typeof CONNECTION_TYPES)[number]
  )
}
