import { NextRequest, NextResponse } from "next/server";
import { WeeklyMenuData, DayMenuSchedule } from "@/types/mess";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Standard meal timings
const DEFAULT_TIMINGS = {
  breakfast: "07:30 AM - 09:00 AM",
  lunch: "12:30 PM - 02:00 PM",
  snacks: "05:00 PM - 06:00 PM",
  dinner: "07:30 PM - 09:00 PM",
};

// Seeded with the official SSB Saveetha Engineering Academic Hostel Menu August 2025
let activeWeeklyMenu: WeeklyMenuData = {
  id: "menu-saveetha-aug-2025",
  title: "SSB Saveetha Engineering New Academic Hostel Menu (August 2025 - Active Week)",
  updated_at: new Date().toISOString(),
  updated_by: "Chief Warden & Catering Committee",
  source: "PDF_UPLOAD",
  notes: "The menu is subject to change based on seasonal availability and ingredient freshness.",
  days: [
    {
      day: "Monday",
      timings: DEFAULT_TIMINGS,
      breakfast: "Karam Idly, Sweet Attukulu Upma, Small Onion Sambar, Onion Tomato Pachadi, Fruit Kesari, Bread / Jam, Scrambled Egg, Hot Milk, Coffee",
      lunch: "Steamed Rice, Andhra Tomato Pappu, Pudina Rice, Cabbage Thoran, Coconut Thoviyal, Pepper Rasam, Curd Rice, Buttermilk, Curd Chilly, Potato Chips (Veg), Egg Chettinad Curry",
      snacks: "Keerai Bonda, Milk, Coffee, Tea",
      dinner: "Palak Chappathi (4 Nos), Rayalaseema Style Chicken Gravy, Mushroom Masala (Veg), Idly, Coconut Chutney, Steamed Rice, Raw Banana Varuval, Dal Rasam, Hot Milk, Banana",
      specialNote: "Special Egg Chettinad Curry & Rayalaseema Chicken Gravy",
    },
    {
      day: "Tuesday",
      timings: DEFAULT_TIMINGS,
      breakfast: "Noodles Idly, Adai Dosai, Andhra Tiffin Sambar, Allam Chutney, Bread Omelette, Plain Bread, Jam, Hot Milk, Coffee",
      lunch: "Steamed Rice, Bendakaya Vatha Kulambu, Majjiga Pulusu, Lemon Rice, Fryums, Yam Vepudu, Snake Gourd Kootu, Garlic Rasam, Buttermilk, Parupu Podi & Ghee, Fruit Kesari",
      snacks: "Peanut Chaat, Milk, Coffee, Tea",
      dinner: "Mushroom, Soya, Veg Dum Biriyani, Nellore Chicken Pulusu, Rajma Masala (For Veg), Idly, Coconut Chutney, Steamed Rice, Rasam, Mango Pickle, Hot Milk, Banana",
      specialNote: "Veg Dum Biriyani & Nellore Chicken Pulusu",
    },
    {
      day: "Wednesday",
      timings: DEFAULT_TIMINGS,
      breakfast: "Idly, Ven Pongal, Brinjal Kosthu, Coconut Chutney, Medhu Vadai, Karam, Gingelly Oil, Hot Milk, Coffee",
      lunch: "Steamed Rice, Gutti Vankaya Koora, Coconut Rice, Potato Chips, Thoviyal, Cabbage Kootu, Pepper Rasam, Curd Rice, Semiya Kheer, Pickle, Chicken Semi Gravy, Veg Roll (Veg)",
      snacks: "Black Channa Sundal, Milk, Coffee, Tea",
      dinner: "Methi Chappathi, Veg Chettinad Curry, Idly, Bisebellabath, Coconut Chutney, Steamed Rice, Rasam, Curd Rice, Hot Milk, Papaya Cut, Lime Pickle",
      specialNote: "Chicken Semi Gravy & Semiya Kheer Dessert",
    },
    {
      day: "Thursday",
      timings: DEFAULT_TIMINGS,
      breakfast: "Rava Idly, Podi Dosai / Plain Dosai, Pumpkin Sambar, Kara Chutney, Bread, Jam, Boiled Egg, Hot Milk, Coffee",
      lunch: "Steamed Rice, Gongura Tomato Pappu, Tamarind Rice, Raw Banana Fry, Greens Kootu, Ulava Rasam, Curd Rice, Buttermilk, Pappad, Pickle, Andhra Chepala Pulusu (Fish), Aloo Gobi Paneer Adraki Dry (Veg)",
      snacks: "South Style Pasta, Milk, Coffee, Tea",
      dinner: "Parotta (3 Nos), Veg Paya, Idly, Chennai Sambar, Peanut Chutney, Steamed Rice, Rasam, Hot Milk, Morris Banana, Mango Pickle, Curd Rice",
      specialNote: "Andhra Chepala Pulusu (Fish) & Hot Parotta Feast",
    },
    {
      day: "Friday",
      timings: DEFAULT_TIMINGS,
      breakfast: "Rice Uppindi, Moong Dal Sambar, White Chutney, Poori, Black Chenna Kadala Curry, Bread, Jam, Hot Milk, Coffee",
      lunch: "Steamed Rice, Beans Sambar, Tomato Pappu, Ambur Spl Egg Biriyani, Onion Raitha, Gongura Potato Fry, Potlakaya Vepudu, Tomato Rasam, Curd Rice, Buttermilk, Appalam, Bread Halwa",
      snacks: "Keerai Bonda, Milk, Coffee, Ginger Tea",
      dinner: "Idly, Kal Dosai, Chicken Chettinad Masala, Aloo Palak (Veg), Red Chutney, Steamed Rice, Mixed Veg Poriyal, Rasam, Hot Milk, Water Melon, Lime Pickle, Curd Rice",
      specialNote: "Ambur Spl Egg Biriyani & Bread Halwa",
    },
    {
      day: "Saturday",
      timings: DEFAULT_TIMINGS,
      breakfast: "Idly, Poha + Mixer, Garelu (Medu Vada), Andhra Tiffen Sambar, Tomato Chutney, Bread, Jam, Hot Milk, Coffee",
      lunch: "Steamed Rice, Greens Sambar, Bindi Karakukambu, Curryleaf Rice, Ridge Gourd Kootu, Mix Veg Poriyal, Garlic Rasam, Curd Rice, Potato Chips (Veg), Buttermilk, Pappad / Pickle, Mutton Masala (Village Style), Aloo 65 (Veg)",
      snacks: "Mysore Bonda, Milk, Coffee, Tea",
      dinner: "Schezwan Egg Fried Rice, Schezwan Veg Fried Rice, Tomato Ketchup, Idly, Rava Uppindi, Coconut Chutney, Steamed Rice, Rasam, Hot Milk, Lime Pickle, Banana",
      specialNote: "Village Style Mutton Masala & Schezwan Fried Rice",
    },
    {
      day: "Sunday",
      timings: {
        breakfast: "07:30 AM - 09:30 AM",
        lunch: "12:30 PM - 02:30 PM",
        snacks: "05:00 PM - 06:00 PM",
        dinner: "07:30 PM - 09:30 PM",
      },
      breakfast: "Kothimeera Milagu Pongal, Medhu Vadai, Dal Kosthu, Ragi Kozhi, Peanut Chutney, Hot Milk, Coffee, Bread, Jam",
      lunch: "Steamed Rice, Kalyana Sambar, Manathakkali Vatha Kulambu, Beetroot Channa Poriyal, Tomato Rasam, Curd Rice, Buttermilk, Potato Chips (Veg), Ice Cream, Chicken Biriyani (Seeraga Samba), Brinjal Masala, Mushroom Biriyani (Veg)",
      snacks: "Ragi Puttu, Milk, Coffee, Tea",
      dinner: "Idly, Masala Uthappam, Sambar, Coconut Chutney, Steamed Rice, Yam Fry, Rasam, Hot Milk, Morris Banana, Idly Podi, Gingelly Oil",
      specialNote: "Grand Sunday Feast: Seeraga Samba Chicken Biriyani & Ice Cream",
    },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: activeWeeklyMenu,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json({ success: false, error: "Empty request payload" }, { status: 400 });
    }

    // Merge or replace days if provided
    let updatedDays = activeWeeklyMenu.days;
    if (Array.isArray(body.days) && body.days.length > 0) {
      updatedDays = body.days;
    } else if (body.dayToUpdate && body.meals) {
      updatedDays = activeWeeklyMenu.days.map((d) => {
        if (d.day.toLowerCase() === body.dayToUpdate.toLowerCase()) {
          return {
            ...d,
            ...body.meals,
          };
        }
        return d;
      });
    }

    activeWeeklyMenu = {
      ...activeWeeklyMenu,
      title: body.title || activeWeeklyMenu.title,
      notes: body.notes || activeWeeklyMenu.notes,
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || "Chief Warden Office",
      source: body.source || "MANUAL_ENTRY",
      attachment_url: body.attachment_url !== undefined ? body.attachment_url : activeWeeklyMenu.attachment_url,
      attachment_name: body.attachment_name !== undefined ? body.attachment_name : activeWeeklyMenu.attachment_name,
      days: updatedDays,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("mess_menu")
          .upsert({
            id: activeWeeklyMenu.id,
            title: activeWeeklyMenu.title,
            data: activeWeeklyMenu,
            updated_at: activeWeeklyMenu.updated_at,
          });
      } catch (err) {
        console.warn("Supabase mess menu fallback:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: activeWeeklyMenu,
      message: "Mess menu updated successfully and published to student portal.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
