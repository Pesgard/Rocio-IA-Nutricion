/* ===========================================
   📘 comidas_rules.pl
   Reglas lógicas para recomendaciones de comidas
   Compatible con hechos dinámicos de FoodData Central
   =========================================== */

/* ===========================================
   🔍 REGLAS DE RECOMENDACIÓN (Actualizadas)
   =========================================== */

% NOTA: Ahora comida/7 incluye FdcId como último parámetro
% comida(Name, Climate, State, TimeType, Category, Calories, FdcId)

% 1️⃣ Recomendación general
recomendar(Climate, State, Time, Food) :-
    comida(Food, Climate, State, TimeType, _, _, _),
    (Time =< 40 -> TimeType = quick ; TimeType \= quick).

% 2️⃣ Recomendación por categoría
recomendar_category(Climate, State, Category, Food) :-
    comida(Food, Climate, State, _, Category, _, _).

% 3️⃣ Comidas saludables (bajas en calorías)
recomendar_healthy(Climate, State, Food) :-
    comida(Food, Climate, State, _, _, Cal, _),
    Cal =< 250.

% 4️⃣ Comidas de alta energía (para baja oxigenación)
recomendar_energy(State, Food) :-
    State = low_oxygen,
    comida(Food, _, State, _, _, Cal, _),
    Cal >= 300.

% 5️⃣ Comidas calientes para clima frío
recomendar_by_climate(cold, Food) :-
    comida(Food, cold, _, _, _, Cal, _),
    Cal >= 300.

% 6️⃣ Comidas ligeras para clima caliente
recomendar_by_climate(hot, Food) :-
    comida(Food, hot, _, _, _, Cal, _),
    Cal =< 300.

% 7️⃣ Recomendación por tiempo disponible
recomendar_by_time(Time, Food) :-
    (Time =< 20 -> comida(Food, _, _, quick, _, _, _) ;
     Time =< 45 -> comida(Food, _, _, medium, _, _, _) ;
                   comida(Food, _, _, long, _, _, _)).

% 8️⃣ Opciones balanceadas para estado normal y clima templado
recomendar_balanced(Food) :-
    comida(Food, warm, normal, quick, _, Cal, _),
    Cal >= 180, Cal =< 350.

/* ===========================================
   🎯 REGLAS AVANZADAS
   =========================================== */

% 9️⃣ Recomendación por rango de calorías
recomendar_by_calories(MinCal, MaxCal, Food) :-
    comida(Food, _, _, _, _, Cal, _),
    Cal >= MinCal,
    Cal =< MaxCal.

% 🔟 Comidas de categoría específica con tiempo rápido
recomendar_quick_category(Category, Food) :-
    comida(Food, _, _, quick, Category, _, _).

% 1️⃣1️⃣ Comidas para deportistas (alta proteína, estimado por calorías)
recomendar_deportista(Food) :-
    comida(Food, _, low_oxygen, _, _, Cal, _),
    Cal >= 400.

% 1️⃣2️⃣ Comidas para perder peso (bajas calorías)
recomendar_diet(Food) :-
    comida(Food, _, _, _, _, Cal, _),
    Cal =< 300.

/* ===========================================
   🔗 UTILIDADES
   =========================================== */

% Obtener información completa de una comida
food_info(FoodName, Info) :-
    comida(FoodName, Climate, State, Time, Category, Calories, FdcId),
    Info = _{
        name: FoodName,
        climate: Climate,
        state: State,
        prep_time: Time,
        category: Category,
        calories: Calories,
        fdc_id: FdcId
    }.

% Obtener nombre para mostrar
display_name(FoodName, DisplayName) :-
    (food_display_name(FoodName, DisplayName) -> true ; DisplayName = FoodName).

% Listar todas las comidas de una categoría
list_by_category(Category, Foods) :-
    findall(F, comida(F, _, _, _, Category, _, _), Foods).

% Contar comidas totales
count_foods(Count) :-
    findall(F, comida(F, _, _, _, _, _, _), Foods),
    length(Foods, Count).

/* ===========================================
   📊 ESTADÍSTICAS
   =========================================== */

% Promedio de calorías por categoría
average_calories_by_category(Category, Average) :-
    findall(Cal, comida(_, _, _, _, Category, Cal, _), Calories),
    sum_list(Calories, Total),
    length(Calories, Count),
    Count > 0,
    Average is Total / Count.

% Comida con más calorías
highest_calorie_food(Food, Calories) :-
    comida(Food, _, _, _, _, Calories, _),
    \+ (comida(_, _, _, _, _, OtherCal, _), OtherCal > Calories).

% Comida con menos calorías
lowest_calorie_food(Food, Calories) :-
    comida(Food, _, _, _, _, Calories, _),
    \+ (comida(_, _, _, _, _, OtherCal, _), OtherCal < Calories).
