const u = (id: string) => (w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photos = {
  modernHouse: u('1600585154340-be6161a56a0c'),
  whiteHouse: u('1523217582562-09d0def993a6'),
  eveningHouse: u('1494526585095-c41746248156'),
  poolVilla: u('1613490493576-7fde63acd811'),
  whiteVilla: u('1512917774080-9991f1c4c750'),
  apartment: u('1545324418-cc1a3fa10c00'),
  facade: u('1488972685288-c3fd157d7c7a'),
  city: u('1582407947304-fd86f028f716'),
  siteTeam: u('1541888946425-d81bb19240f5'),
  siteWork: u('1504307651254-35680f356dfd'),
  blueprint: u('1503387762-592deb58ef4e'),
  field: u('1500382017468-9049fed747ef'),
  crops: u('1625246333195-78d9c38ad449'),
  keys: u('1560518883-ce09059eeffa'),
  jaipur: u('1477587458883-47145ed94245'),
  office: u('1497366216548-37526070297c'),
  architecture: u('1487958449943-2429e8be8625'),
};
