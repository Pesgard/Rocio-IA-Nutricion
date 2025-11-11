/* ===========================================
   📘 comidas.pl (versión en inglés)
   Compatible con FoodData Central API
   =========================================== */

% comida(Name, Climate, State, TimeType, Category, Calories)
% Climate: cold | hot | warm
% State: normal | low_oxygen
% TimeType: quick | medium | long
% Category: breakfast | lunch | dinner | snack

% --- Breakfast (10) ---
comida(spinach_omelette, hot, normal, quick, breakfast, 230).
comida(oatmeal_fruits, cold, normal, quick, breakfast, 180).
comida(avocado_toast, warm, normal, quick, breakfast, 210).
comida(protein_smoothie, hot, low_oxygen, quick, breakfast, 250).
comida(wholegrain_bread_honey, cold, low_oxygen, quick, breakfast, 200).
comida(yogurt_granola, warm, normal, quick, breakfast, 190).
comida(eggs_tomato, hot, normal, quick, breakfast, 220).
comida(fruit_salad, warm, low_oxygen, quick, breakfast, 160).
comida(banana_oat_shake, cold, normal, quick, breakfast, 230).
comida(spinach_egg_sandwich, hot, normal, medium, breakfast, 280).

% --- Lunch (15) ---
comida(chicken_wrap, hot, low_oxygen, quick, lunch, 350).
comida(quinoa_salad, warm, normal, quick, lunch, 320).
comida(vegetable_rice, warm, low_oxygen, medium, lunch, 380).
comida(lentil_soup, cold, low_oxygen, medium, lunch, 300).
comida(tuna_sandwich, warm, normal, quick, lunch, 330).
comida(wholewheat_pasta_chicken, hot, normal, medium, lunch, 400).
comida(chickpea_salad, warm, normal, quick, lunch, 290).
comida(salmon_rice_bowl, cold, low_oxygen, medium, lunch, 370).
comida(cheese_arepa, warm, normal, quick, lunch, 310).
comida(vegetable_burrito, hot, normal, quick, lunch, 340).
comida(tuna_wrap, hot, low_oxygen, quick, lunch, 320).
comida(chicken_fajitas, hot, normal, medium, lunch, 360).
comida(pasta_salad_tomato, warm, normal, quick, lunch, 300).
comida(stirfried_tofu, hot, low_oxygen, medium, lunch, 330).
comida(roasted_chicken_potatoes, cold, normal, long, lunch, 420).

% --- Dinner (15) ---
comida(vegetable_soup, cold, low_oxygen, quick, dinner, 250).
comida(chicken_salad, warm, normal, quick, dinner, 280).
comida(fish_fillet, hot, normal, medium, dinner, 350).
comida(egg_whites_omelette, warm, low_oxygen, quick, dinner, 210).
comida(pumpkin_cream_soup, cold, normal, medium, dinner, 270).
comida(quinoa_rice, warm, low_oxygen, medium, dinner, 300).
comida(tofu_salad, hot, normal, quick, dinner, 260).
comida(turkey_sandwich, warm, normal, quick, dinner, 290).
comida(grilled_chicken, hot, low_oxygen, medium, dinner, 310).
comida(egg_salad, warm, normal, quick, dinner, 240).
comida(tomato_soup, cold, normal, quick, dinner, 220).
comida(cereal_milk_bowl, warm, low_oxygen, quick, dinner, 260).
comida(tomato_pasta, hot, normal, medium, dinner, 330).
comida(quinoa_soup, cold, low_oxygen, medium, dinner, 280).
comida(tuna_salad, warm, normal, quick, dinner, 290).

% --- Snacks (10) ---
comida(cereal_bar, warm, normal, quick, snack, 150).
comida(apple_peanut_butter, warm, low_oxygen, quick, snack, 180).
comida(yogurt_fruit, cold, normal, quick, snack, 170).
comida(mixed_nuts, warm, normal, quick, snack, 200).
comida(green_smoothie, hot, low_oxygen, quick, snack, 160).
comida(wholegrain_cookies, warm, normal, quick, snack, 140).
comida(banana_almonds, hot, normal, quick, snack, 190).
comida(avocado_toast_snack, warm, low_oxygen, quick, snack, 220).
comida(protein_bar, hot, low_oxygen, quick, snack, 210).
comida(popcorn, warm, normal, quick, snack, 120).

/* ===========================================
   🔍 Logical Rules (8)
   =========================================== */

% 1️⃣ General recommendation
recomendar(Climate, State, Time, Food) :-
    comida(Food, Climate, State, TimeType, _, _),
    (Time =< 40 -> TimeType = quick ; TimeType \= quick).

% 2️⃣ Recommendation by category
recomendar_category(Climate, State, Category, Food) :-
    comida(Food, Climate, State, _, Category, _).

% 3️⃣ Healthy (low-calorie) foods
recomendar_healthy(Climate, State, Food) :-
    comida(Food, Climate, State, _, _, Cal),
    Cal =< 250.

% 4️⃣ High-energy foods (for low oxygen)
recomendar_energy(State, Food) :-
    State = low_oxygen,
    comida(Food, _, State, _, _, Cal),
    Cal >= 300.

% 5️⃣ Warm foods for cold weather
recomendar_by_climate(cold, Food) :-
    comida(Food, cold, _, _, _, Cal),
    Cal >= 300.

% 6️⃣ Light foods for hot weather
recomendar_by_climate(hot, Food) :-
    comida(Food, hot, _, _, _, Cal),
    Cal =< 300.

% 7️⃣ Recommendation by available time
recomendar_by_time(Time, Food) :-
    (Time =< 20 -> comida(Food, _, _, quick, _, _) ;
     Time =< 45 -> comida(Food, _, _, medium, _, _) ;
                     comida(Food, _, _, long, _, _)).

% 8️⃣ Balanced options for normal state and warm climate
recomendar_balanced(Food) :-
    comida(Food, warm, normal, quick, _, Cal),
    Cal >= 180, Cal =< 350.
