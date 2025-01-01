export type MenuItemId = 
    '/' | 
    'clients' | 
    'products' | 
    'reminders' | 
    'reports' |
    'moneybox' |
    'payments' |
    null;

export interface MenuContextType {
  selected: MenuItemId;
  setSelected: (id: MenuItemId) => void;

}
