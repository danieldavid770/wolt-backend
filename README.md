# שרת Backend בסגנון Wolt

שרת Express + MongoDB/Mongoose בסגנון Wolt: קטגוריות → עסקים → מוצרים → סל קניות →
כתובת → הזמנה, עם הרשאות לפי תפקיד (`user` / `business` / `admin`) ומחיר שמחושב
תמיד בצד השרת.

## התקנה והרצה

```bash
npm install
cp .env.example .env
# ערכו את .env: MONGO_CONNECTION, SECRET_KEY, ואם צריך את Cloudinary
npm run dev
```

יש לוודא ש-MongoDB רץ (מקומי או Atlas) לפי מה שמוגדר ב-`MONGO_CONNECTION`.

## זריעת נתוני בדיקה (Seed)

מוחק את כל האוספים ויוצר משתמש מכל תפקיד + קטגוריה + עסק + מוצר + כתובת + באנר:

```bash
node scripts/seed.js
```

פלט הסקריפט מדפיס את פרטי ההתחברות והמזהים שנוצרו. כל הסיסמאות: `123456`.

| תפקיד    | אימייל              |
| -------- | -------------------- |
| admin    | admin@wolt.test       |
| business | business@wolt.test    |
| user     | user@wolt.test         |

## מבנה הפרויקט

```
config/        # חיבור MongoDB, Cloudinary
models/        # Mongoose schemas: user, category, business, product, address, banner, order
validators/    # Joi validators, קובץ אחד לכל collection
services/      # גישה נקייה ל-DB, בלי req/res
controllers/   # דק — קורא ל-validator + service, זורק AppError
routes/        # מחבר authMiddleware + role checks + controller
middlewares/   # auth, role, error, upload, rate-limit
utils/         # AppError, asyncHandler
scripts/seed.js
postman/       # Postman Collection מלא
```

כל בקר עטוף ב-`asyncHandler` וזורק `AppError(message, statusCode)`; שגיאה מרכזית
אחת (`middlewares/error.middleware.js`) מטפלת בכל השגיאות — כולל שגיאות ולידציה
של Mongoose, מפתח כפול (11000), ObjectId לא תקין, שגיאות JWT, ושגיאות Multer.

## הרשאות (roles)

- **user**: הרשמה/התחברות, סל קניות אישי, כתובות אישיות, יצירת הזמנה, צפייה
  בהזמנות שלו בלבד, דירוג הזמנה שהושלמה.
- **business**: כל מה שמשתמש רגיל יכול + יצירת עסק אחד (חשבון business יכול
  לבעול עסק אחד), עדכון/מחיקה רק של העסק שלו, יצירה/עדכון/מחיקה של מוצרים רק
  תחת העסק שלו, צפייה ועדכון סטטוס של הזמנות שכוללות את העסק שלו.
- **admin**: CRUD מלא על קטגוריות, באנרים, עסקים, מוצרים והזמנות; רשימת כל
  המשתמשים.

הרשמה (`POST /users/register`) מאפשרת לבחור `role` ישירות — זה תואם את הדפוס
המקורי של ה-starter (הקמת admin ראשון), אבל שימו לב: בפרויקט אמיתי בפרודקשן
אין לחשוף בחירת role חופשית בהרשמה ציבורית.

## החלטות מודלינג (סטייה מ-`dataMOdeling.md`)

הקובץ המקורי מלא בקיצורים וטעויות הקלדה (`descrption`, `requird`, `bussiness`,
`tekeIn`/`finshed`, `solt` וכו'). תורגם לשמות שדות ברורים ותקינים באנגלית, בין
היתר:

- `tekeIn` / `finshed` → `takenAt` / `finishedAt` (מתעדכן אוטומטית עם שינוי סטטוס)
- `nestedCat` → קטגוריה מקבלת גם `parentCategory` וגם `subCategories` (עץ דו-כיווני)
- `favsAr` (עסק) → `favoritedBy`, `userBuy` (מוצר) → `purchasedBy`, `likedPord` → `likedBy`
- `solt` (מופיע גם בעסק וגם בכתובת) — לא היה ברור מה בדיוק, נשמר כשדה אופציונלי
  בשם `locationCode`, מחרוזת של 6 תווים בדיוק כשהוא קיים.
- ב-Order, `categoryId` בודד הוסר — הזמנה יכולה להכיל מוצרים ממספר קטגיות; במקום
  זאת יש מערך `products` (שורות הזמנה מלאות) ו-`businesses` (נגזר אוטומטית).

## חישוב מחיר — לא סומכים על הלקוח

`POST /orders/create` מקבל רק `{ addressId, tip }`. השרת:

1. טוען את הסל של המשתמש המחובר (מזוהה מה-JWT, לא מהבקשה).
2. מוודא שהכתובת שייכת למשתמש.
3. טוען מחדש כל מוצר ועסק מה-DB (לא סומך על מחיר שנשמר בסל בזמן ההוספה),
   ומוודא שהם עדיין פעילים.
4. מחשב `unitPrice = product.price + sum(selectedOptions.price)`,
   `lineTotal = unitPrice * quantity`, `subtotal`, ואז `totalPrice = subtotal - discount + tip`.
5. יוצר את ההזמנה בסטטוס `pending` ומרוקן את הסל.

כל שדה מחיר שנשלח מהלקוח (`price`, `totalPrice` וכו') נדחה על ידי ה-Joi
validator (`unknown field`) — אין אפילו אפשרות "להתעלם" ממנו בשקט.

מעברי סטטוס מוגבלים לטבלת מעברים חוקית:
`pending → confirmed → preparing → out_for_delivery → delivered`, עם `cancelled`
אפשרי מכל שלב לפני `delivered`. `delivered` ו-`cancelled` הם סופיים.

## בדיקה ב-Postman

יבאו את `postman/wolt-backend.postman_collection.json` ל-Postman. הקולקשן כולל
55 בקשות ב-9 תיקיות (Auth, Users, Cart, Categories, Businesses, Products,
Addresses, Banners, Orders), כולל תרחישי שלילה (403/401/400).

1. ודאו ש-`baseUrl` (משתנה קולקשן) מצביע לשרת שלכם (ברירת מחדל `http://localhost:8000`).
2. הריצו את תיקיית **1. Auth** קודם — היא רושמת ומתחברת עם user/business/admin
   ושומרת את הטוקנים (`userToken`, `businessToken`, `adminToken`) אוטומטית
   דרך test scripts.
3. המשיכו לפי סדר התיקיות (2 עד 9) — כל בקשת "Create" שומרת את ה-id שנוצר
   (`categoryId`, `businessId`, `productId`, `addressId`, `orderId`, `cartItemId`)
   כמשתנה קולקשן לבקשות הבאות.
4. בקשות "Negative" בודקות הרשאות ושגיאות ולידציה חסרות.

לחלופין ניתן להריץ `node scripts/seed.js` ואז לדלג ישר לתיקיות 3 ומעלה עם
המזהים המודפסים בפלט הסקריפט.

## אבטחה

- `helmet` על כל השרת.
- Rate limit כללי (100/15 דק'), התחברות (5/15 דק'), העלאת תמונה (10/15 דק').
- סיסמאות מוצפנות עם bcrypt, לעולם לא מוחזרות בתגובה (`.select("-password")`).
- JWT ב-header `x-api-key`, תוקף 7 ימים.
