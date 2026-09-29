export type ItemStatus = "wanted" | "bought";

export type Item = {
  id: string;
  user_id: string;
  name: string;
  url: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  category: string | null;
  status: ItemStatus;
  priority: boolean;
  target_date: string | null;
  bought_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ShareLink = {
  token: string;
  enabled: boolean;
  title: string | null;
};

// The only fields the public share page ever receives (see
// get_shared_wishlist in the share_links migration).
export type SharedItem = Pick<
  Item,
  | "id"
  | "name"
  | "url"
  | "image_url"
  | "price"
  | "currency"
  | "category"
  | "priority"
  | "target_date"
>;

export type Budget = {
  id: string;
  user_id: string;
  year: number;
  amount: number;
  currency: string;
};
