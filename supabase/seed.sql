-- Seed data for HostelConnect 2.0 Hackathon Demo

-- Sample Mess Menu for the current week
INSERT INTO public.mess_menu (day_of_week, meal_type, items, timing, is_special) VALUES
('MONDAY', 'BREAKFAST', ARRAY['Idli', 'Medu Vada', 'Sambar', 'Coconut Chutney', 'Tea/Coffee'], '07:30 - 09:00', false),
('MONDAY', 'LUNCH', ARRAY['Steamed Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Phulka', 'Curd'], '12:30 - 14:00', false),
('MONDAY', 'SNACKS', ARRAY['Samosa', 'Green Chutney', 'Cardamom Tea'], '17:00 - 18:00', false),
('MONDAY', 'DINNER', ARRAY['Veg Biryani', 'Raita', 'Gulab Jamun', 'Mixed Veg Curry'], '19:30 - 21:00', true),

('TUESDAY', 'BREAKFAST', ARRAY['Poha', 'Boiled Eggs', 'Upma', 'Mint Chutney', 'Coffee'], '07:30 - 09:00', false),
('TUESDAY', 'LUNCH', ARRAY['Jeera Rice', 'Rajma Masala', 'Aloo Gobi', 'Roti', 'Salad'], '12:30 - 14:00', false),
('TUESDAY', 'SNACKS', ARRAY['Veg Cutlet', 'Chai'], '17:00 - 18:00', false),
('TUESDAY', 'DINNER', ARRAY['Chapati', 'Chicken Curry / Kadai Paneer', 'Rice', 'Rasat', 'Ice Cream'], '19:30 - 21:00', true),

('WEDNESDAY', 'BREAKFAST', ARRAY['Masala Dosa', 'Sambar', 'Tomato Chutney', 'Tea'], '07:30 - 09:00', false),
('WEDNESDAY', 'LUNCH', ARRAY['Lemon Rice', 'Kadhi Pakora', 'Bhindi Masala', 'Phulka'], '12:30 - 14:00', false),
('WEDNESDAY', 'SNACKS', ARRAY['Biscuits', 'Mirchi Bajji', 'Tea'], '17:00 - 18:00', false),
('WEDNESDAY', 'DINNER', ARRAY['Fried Rice', 'Gobi Manchurian', 'Egg Curry', 'Sweet Corn Soup'], '19:30 - 21:00', false),

('THURSDAY', 'BREAKFAST', ARRAY['Aloo Paratha', 'Curd', 'Pickle', 'Fresh Fruits', 'Tea'], '07:30 - 09:00', false),
('THURSDAY', 'LUNCH', ARRAY['South Indian Thali', 'Sambar', 'Rasam', 'Poriyal', 'Papad', 'Payasam'], '12:30 - 14:00', false),
('THURSDAY', 'SNACKS', ARRAY['Bread Pakora', 'Chai'], '17:00 - 18:00', false),
('THURSDAY', 'DINNER', ARRAY['Roti', 'Dal Makhani', 'Shahi Paneer', 'Jeera Rice'], '19:30 - 21:00', false),

('FRIDAY', 'BREAKFAST', ARRAY['Poori', 'Aloo Masala', 'Kesari Bath', 'Tea/Coffee'], '07:30 - 09:00', true),
('FRIDAY', 'LUNCH', ARRAY['Veg Pulao', 'Chana Masala', 'Boondi Raita', 'Roti'], '12:30 - 14:00', false),
('FRIDAY', 'SNACKS', ARRAY['Sweet Corn', 'Masala Tea'], '17:00 - 18:00', false),
('FRIDAY', 'DINNER', ARRAY['Naan', 'Butter Chicken / Paneer Tikka Masala', 'Biryani Rice', 'Kheer'], '19:30 - 21:00', true),

('SATURDAY', 'BREAKFAST', ARRAY['Uttapam', 'Sambar', 'Peanut Chutney', 'Boiled Sprouts', 'Tea'], '08:00 - 09:30', false),
('SATURDAY', 'LUNCH', ARRAY['Rice', 'Dal Palak', 'Aloo Methi', 'Curd', 'Papad'], '12:30 - 14:00', false),
('SATURDAY', 'SNACKS', ARRAY['Puff Pastry', 'Filter Coffee'], '17:00 - 18:00', false),
('SATURDAY', 'DINNER', ARRAY['Pav Bhaji', 'Pulao', 'Raita', 'Chocolate Mousse'], '19:30 - 21:00', true),

('SUNDAY', 'BREAKFAST', ARRAY['Chole Bhature', 'Sweet Lassi', 'Fruit Salad', 'Chai'], '08:00 - 10:00', true),
('SUNDAY', 'LUNCH', ARRAY['Special Hyderabadi Dum Biryani', 'Mirchi Ka Salan', 'Raita', 'Double Ka Meetha'], '12:30 - 14:30', true),
('SUNDAY', 'SNACKS', ARRAY['Bhel Puri', 'Tea'], '17:00 - 18:00', false),
('SUNDAY', 'DINNER', ARRAY['Light Khichdi', 'Papad', 'Ghee', 'Mixed Sabzi', 'Custard'], '19:30 - 21:00', false)
ON CONFLICT DO NOTHING;
