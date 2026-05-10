# FEATURES_ROADMAP.md

Продуктовый roadmap фичей для LMS/CRM. Взаимодополняет `FEATURE_IMPLEMENTATION_MASTERPLAN.md` (архитектура) — здесь фокус на **что строить** и **кому это нужно**.

Легенда: Complexity/Risk — `L` / `M` / `H`. Priority — `P0..P3`.

---

## 1. Для владельца/CEO

### 1.1 Dashboard по филиалам
- **Описание:** сводка ключевых метрик по каждому филиалу: выручка, расходы, студенты активные/новые/ушедшие, долги, прибыль.
- **Кому:** CEO, управляющие партнёры.
- **Польза:** видит состояние сети без открытия каждого филиала.
- **Complexity:** M | **Risk:** L
- **Backend:** `DashboardModule` (агрегаты по Transaction, Student).
- **Frontend:** `/dashboard` (уже есть index) — переработать в widget-based.
- **Миграция:** нет (возможно — materialized view позже).
- **API:** `GET /dashboard/branches?period=month`, `GET /dashboard/summary`.
- **UI:** grid карточек с KPI, графики динамики.
- **Priority:** **P1**.

### 1.2 Финансовый отчёт (P/L)
- **Описание:** отчёт прибыль/расход/чистая прибыль по выбранному периоду с разбивкой по статьям.
- **Польза:** принятие решений на базе цифр.
- **Complexity:** M | **Risk:** L
- **Backend:** `ReportModule` → финансовые агрегаты.
- **Frontend:** `/reports/pnl`.
- **Миграция:** нет.
- **API:** `GET /reports/pnl?from=...&to=...&branchId=...`.
- **UI:** таблица + график + кнопки экспорт Excel/PDF.
- **Priority:** **P1**.

### 1.3 KPI сотрудников
- **Описание:** для каждого сотрудника — метрики: у менеджера конверсия лидов, у ментора — посещаемость/оценки его групп, у всех — штрафы/бонусы/зарплата.
- **Complexity:** H | **Risk:** M
- **Backend:** новые агрегаты + возможно `mv_employee_kpi`.
- **Frontend:** `/staffs/:id` расширить tab-KPI.
- **API:** `GET /staffs/:id/kpi?period=month`.
- **UI:** радар-диаграмма + карточки-метрики.
- **Priority:** **P1**.

### 1.4 Динамика студентов (cohort)
- **Описание:** когорты по месяцу регистрации, ретеншен, отток.
- **Complexity:** H | **Risk:** L
- **Backend:** reporting queries.
- **Frontend:** `/analytics/retention`.
- **UI:** heatmap когорт.
- **Priority:** **P2**.

### 1.5 Месячные отчёты (scheduled)
- **Описание:** автогенерируемый отчёт раз в месяц, приходит на email/Telegram CEO.
- **Complexity:** M | **Risk:** L
- **Backend:** cron + notification + export.
- **Priority:** **P2**.

---

## 2. Для менеджера

### 2.1 Воронка лидов (Kanban)
- **Описание:** drag-and-drop между стадиями (new → contacted → interested → waitingGroup → inGroup / refused).
- **Польза:** наглядность, скорость.
- **Complexity:** M | **Risk:** L
- **Backend:** без изменений (есть `LeedStatus`).
- **Frontend:** `/leeds` — переработать список в Kanban.
- **API:** `PATCH /leeds/:id { status }` — уже есть.
- **UI:** 5 колонок, карточки лидов, drag с react-beautiful-dnd (уже в deps).
- **Priority:** **P1**.

### 2.2 Задачи и напоминания
- **Описание:** к лиду/студенту можно привязать задачу "перезвонить завтра в 14:00", менеджер получает уведомление.
- **Complexity:** M | **Risk:** L
- **Backend:** новая таблица `Task { id, title, dueAt, assignedTo, relatedEntity, relatedId, status }`.
- **Миграция:** да.
- **API:** `POST/GET/PATCH /tasks`.
- **UI:** tab "Задачи" + список сегодня/завтра.
- **Priority:** **P1**.

### 2.3 Источники заявок и причины отказа
- **Описание:** усилить аналитику лидов — группировка по `discoveryMethod`, причины `refused`.
- **Complexity:** L | **Risk:** L
- **Backend:** существующий enum + дополнить `Leed.refusedReason`.
- **Миграция:** small.
- **UI:** аналитика на странице лидов.
- **Priority:** **P1**.

### 2.4 Конверсия в студента (автозапись)
- **Описание:** кнопка "Конвертировать в студента" — на текущем стеке есть `LeedToStudent`, допилить UX.
- **Complexity:** L | **Risk:** M
- **Backend:** существует.
- **UI:** упростить форму, предзаполнять из лида.
- **Priority:** **P1**.

### 2.5 Контроль оплат (реминдер)
- **Описание:** список студентов с долгом по менеджеру, кнопка "Напомнить" → SMS/Telegram.
- **Complexity:** M | **Risk:** L
- **Backend:** notification hub + template.
- **UI:** страница "Мои студенты-должники".
- **Priority:** **P1**.

---

## 3. Для ментора

### 3.1 Моё расписание
- **Описание:** персональное расписание ментора на сегодня/неделю.
- **Complexity:** L | **Risk:** L
- **Backend:** `GET /lessons/my?date=...` — отфильтровать `mentor.userId = req.user.id` (уже есть `justMentor` фильтр).
- **Frontend:** `/my-schedule` или `/mentors/:id` view.
- **Priority:** **P1**.

### 3.2 Журнал посещаемости (mobile-first)
- **Описание:** удобная быстрая отметка на телефоне: свайп / чекбокс / голосовая отметка.
- **Complexity:** M | **Risk:** M
- **Backend:** существует (`attendanceMentor`).
- **Frontend:** `/lessons/:id/check` — переработать mobile-first, крупные tap-targets.
- **Priority:** **P1**.

### 3.3 Оценки
- **Описание:** по каждому студенту — оценки за задания и экзамены, динамика.
- **Complexity:** M | **Risk:** L
- **Backend:** есть `ExamGrade`, добавить оценки за домашние.
- **Миграция:** небольшая (связь Homework ↔ grade).
- **UI:** gradebook-таблица.
- **Priority:** **P2**.

### 3.4 Комментарии по студентам (private notes)
- **Описание:** приватные заметки ментора по каждому студенту.
- **Complexity:** L | **Risk:** L
- **Backend:** таблица `StudentNote { id, studentId, authorId, text, private, createdAt }`.
- **Миграция:** да.
- **UI:** sidebar-panel в карточке студента.
- **Priority:** **P2**.

### 3.5 Домашние задания
- **Описание:** ментор создаёт задание, прикрепляет файлы, студент сдаёт, ментор проверяет.
- **Complexity:** H | **Risk:** M
- **Backend:** `HomeworkModule` + S3 для файлов.
- **Миграция:** да (Homework, HomeworkSubmission).
- **Priority:** **P1**.

---

## 4. Для студента / родителя

### 4.1 Личный кабинет
- **Описание:** вход по отдельной ссылке / Telegram. Видит баланс, расписание, посещаемость, оценки, домашние.
- **Complexity:** H | **Risk:** M
- **Backend:** отдельный auth-flow (student-login) или через Telegram Mini App.
- **Frontend:** новые роуты `/student/*` или `/parent/*`.
- **API:** `GET /me/student`, `GET /me/balance`, ...
- **Priority:** **P1**.

### 4.2 Баланс и история платежей
- **Complexity:** L | **Risk:** L (после создания ЛК)
- **Backend:** есть transactions + student.balance.
- **Priority:** **P1**.

### 4.3 Расписание
- **Complexity:** L | **Risk:** L
- **Priority:** **P1**.

### 4.4 Посещаемость
- **Описание:** календарь с посещёнными/пропущенными уроками.
- **Priority:** **P1**.

### 4.5 Оценки и динамика
- **Complexity:** M | **Risk:** L
- **Priority:** **P2**.

### 4.6 Уведомления
- **Описание:** SMS/Telegram/push о пропусках, оценках, оплатах, замене урока.
- **Complexity:** M (после notification hub) | **Risk:** L
- **Priority:** **P1**.

---

## 5. Финансы

### 5.1 Касса
- **Описание:** вид "касса текущий день" — приходы/расходы за сегодня, остаток наличности.
- **Complexity:** L | **Risk:** L
- **Priority:** **P1**.

### 5.2 Долги (улучшенный)
- **Описание:** уже есть `/accounting/debtors`, добавить сегментацию (просрочка 30+/60+/90+), массовые действия (отправить SMS всем).
- **Complexity:** M | **Risk:** L
- **Priority:** **P1**.

### 5.3 Рассрочка
- **Описание:** план платежей на студента: суммы + даты, автоматические реминдеры.
- **Complexity:** M | **Risk:** M
- **Backend:** `PaymentPlan`, `PaymentPlanItem`.
- **Миграция:** да.
- **Priority:** **P1**.

### 5.4 Зарплаты (улучшенный расчёт)
- **Описание:** текущий расчёт зарплат работает но непрозрачен. Вывести breakdown: уроки × цена × процент, бонусы, штрафы.
- **Complexity:** M | **Risk:** H (финансы!)
- **Backend:** выделить `SalaryService`, добавить журнал.
- **Priority:** **P1** (но аккуратно, с unit-тестами).

### 5.5 Бонусы и штрафы (конструктор)
- **Описание:** правила, по которым автоматически начисляются бонусы (перевыполнение плана) или штрафы (опоздания).
- **Complexity:** H | **Risk:** H
- **Priority:** **P2**.

### 5.6 Экспорт Excel/PDF
- **Описание:** во всех списках — кнопка экспорта.
- **Complexity:** L | **Risk:** L
- **Backend:** `ExportModule`.
- **Priority:** **P1**.

---

## 6. CRM и продажи

### 6.1 Расширенные лиды (теги, scoring)
- **Описание:** теги для сегментации, lead score (автоматический или ручной).
- **Complexity:** M | **Risk:** L
- **Миграция:** `LeadTag`, `LeadTagLink`.
- **Priority:** **P2**.

### 6.2 Источники заявок (UTM tracking)
- **Описание:** расширить `discoveryMethod` UTM-метками с лендинга.
- **Complexity:** M | **Risk:** L
- **Priority:** **P2**.

### 6.3 Причины отказа
- **Описание:** enum + optional free text при `refused`.
- **Complexity:** L | **Risk:** L
- **Priority:** **P1**.

### 6.4 Воронка конверсии (funnel)
- **Описание:** визуализация: сколько лидов на каждой стадии + конверсия стадия-стадия.
- **Complexity:** M | **Risk:** L
- **Priority:** **P2**.

---

## 7. Уведомления

### 7.1 Notification Hub (SMS + Telegram + Email + Push)
- **Описание:** единый слой с шаблонами, каналами, расписанием, журналом.
- **Complexity:** H | **Risk:** M
- **Backend:** `NotificationModule` + `NotificationTemplate` + queue.
- **Миграция:** да.
- **Priority:** **P0**.

### 7.2 SMS-шаблоны (редактируемые)
- **Описание:** админ-панель с редактором шаблонов, переменные типа `{student.fio}`.
- **Complexity:** M | **Risk:** L
- **Priority:** **P1**.

### 7.3 Напоминания об оплате
- **Описание:** за 3/1 день до даты + при просрочке.
- **Complexity:** M | **Risk:** L
- **Priority:** **P1**.

### 7.4 Напоминания об уроках
- **Описание:** за час до начала урока родителю и студенту.
- **Complexity:** M | **Risk:** L
- **Priority:** **P2**.

### 7.5 Telegram-канал для сотрудников
- **Описание:** внутренний канал — новые лиды, оплаты, экстренные уведомления.
- **Complexity:** L | **Risk:** L
- **Priority:** **P2**.

---

## 8. Безопасность

### 8.1 Audit log
- **Описание:** любое действие сотрудника (create/update/delete) фиксируется.
- **Complexity:** M | **Risk:** L
- **Backend:** interceptor.
- **Миграция:** `AuditLog`.
- **Priority:** **P0**.

### 8.2 История действий по сущности
- **Описание:** на странице студента/лида/транзакции — timeline изменений.
- **Complexity:** L (после audit) | **Risk:** L
- **Priority:** **P1**.

### 8.3 2FA
- **Описание:** для CEO и admin — обязательное 2FA (TOTP).
- **Complexity:** M | **Risk:** L
- **Миграция:** `User.totpSecret`, `User.totpEnabled`.
- **Priority:** **P1**.

### 8.4 Ограничение прав (granular permissions)
- **Описание:** перейти от ролей к permissions (RBAC расширенный): `student:create`, `finance:view`, и т.д.
- **Complexity:** H | **Risk:** H
- **Priority:** **P2**.

### 8.5 Журнал входов + device management
- **Описание:** откуда заходили (IP, UA, time), возможность отозвать сессию.
- **Complexity:** M | **Risk:** L
- **Миграция:** `UserSession`.
- **Priority:** **P1**.

---

## 9. Админка и настройки

### 9.1 Role & Permission editor
- **Complexity:** H | **Risk:** H
- **Priority:** **P2**.

### 9.2 Настройки филиалов
- **Описание:** расширить branch-настройки (рабочие часы, SMS-подпись, рабочий телефон).
- **Complexity:** L | **Risk:** L
- **Priority:** **P2**.

### 9.3 Настройки курсов / цен
- **Описание:** история цен, скидки за период, промокоды.
- **Complexity:** M | **Risk:** M
- **Priority:** **P2**.

### 9.4 Конструктор зарплат
- **Описание:** UI, в котором CEO собирает формулу зарплаты ментора (fixed + percent per lesson + bonus for attendance rate).
- **Complexity:** H | **Risk:** H
- **Priority:** **P3**.

### 9.5 Feature flags
- **Описание:** включение/выключение фичей без деплоя.
- **Complexity:** M | **Risk:** L
- **Priority:** **P2**.

---

## 10. AI-фичи (базовые)

### 10.1 AI-отчёт CEO
- **Описание:** текстовый summary от AI: "За месяц филиал А вырос на 12%, филиал Б потерял 3 студентов из-за ...".
- **Complexity:** M (после reporting) | **Risk:** L
- **Priority:** **P2**.

### 10.2 AI-анализ слабых студентов
- **Описание:** AI флагует студентов с падением посещаемости + оценок и объясняет почему.
- **Complexity:** H | **Risk:** M
- **Priority:** **P2**.

### 10.3 AI-помощник менеджера
- **Описание:** "Кому позвонить сегодня" — список top-10 лидов/студентов по приоритету.
- **Complexity:** H | **Risk:** M
- **Priority:** **P2**.

### 10.4 AI-прогноз долгов
- **Описание:** риск того, что студент не заплатит в срок.
- **Complexity:** H | **Risk:** M
- **Priority:** **P2**.

### 10.5 AI-рекомендации по группам
- **Описание:** "В группу А слишком мало студентов — рекомендуется объединить с Б" или "Добавьте смену ментора".
- **Complexity:** H | **Risk:** M
- **Priority:** **P3**.

---

# MVP FEATURE PACK

**10 фичей с максимальной пользой при минимальном риске.** Выбор — прагматичный: закрывают ежедневные боли CEO / менеджера / ментора / родителя, не требуют рискованных изменений.

| № | Фича | Категория | Priority | Почему |
|---|------|-----------|:--------:|--------|
| 1 | **Security hardening** (ValidationPipe, Throttler, helmet, env validation) | Security | P0 | Фундамент. Без него любая фича — риск |
| 2 | **Notification Hub (SMS + Telegram)** с шаблонами | Notifications | P0 | Разблокирует все остальные уведомления |
| 3 | **Audit log** + history по ключевым сущностям | Security | P0 | Прозрачность финансов + защита от кражи данных сотрудником |
| 4 | **Воронка лидов (Kanban)** | CRM | P1 | Моментальный value для менеджеров |
| 5 | **Долги + массовые SMS-напоминания** | Finance | P1 | Прямой ROI: больше собранных денег |
| 6 | **Экспорт Excel/PDF** списков и отчётов | Reporting | P1 | Дешёвая фича, закрывает частый запрос |
| 7 | **Telegram bot (parent)**: баланс, расписание, посещаемость, оплаты | Telegram | P1 | Резкое снижение нагрузки на менеджеров |
| 8 | **Dashboard CEO** с branch metrics + top виджетами | Analytics | P1 | CEO получает картину за 10 секунд |
| 9 | **Рассрочка + scheduled payments** | Finance | P1 | Больше конверсия студентов (родителям проще) |
| 10 | **Домашние задания (базовая версия)** | LMS | P1 | Превращает CRM в полноценную LMS |

---

# IMPLEMENTATION ORDER

Порядок построен так, чтобы каждая следующая фича опиралась на готовую инфраструктуру.

### Этап A — Фундамент (0–4 недели)
1. Security hardening.
2. S3 для uploads.
3. Redis + OTP rebalancing.
4. BullMQ queues.
5. Notification Hub (SMS + Telegram).
6. Audit log.

### Этап B — Ежедневная работа (4–10 недель)
7. Экспорт Excel/PDF.
8. Воронка лидов (Kanban).
9. Долги + массовые SMS.
10. Рассрочка + scheduled payments.
11. Задачи менеджера.
12. Telegram bot (parent: balance, schedule, attendance).

### Этап C — LMS (10–16 недель)
13. Домашние задания.
14. Оценки + gradebook.
15. Мobile-first журнал посещаемости.
16. Student/Parent cabinet (Telegram Mini App или web).

### Этап D — Аналитика (16–22 недели)
17. Dashboard CEO.
18. KPI сотрудников.
19. Финансовые отчёты (P/L).
20. Cohort / retention.

### Этап E — AI + Enterprise (22+ недель)
21. AI-отчёт CEO.
22. Churn prediction.
23. AI-помощник менеджера.
24. Multi-tenant foundation.
25. White-label.

---

# DO NOT BUILD YET

Код не пишем. Это product-strategy. Следующий шаг — выбор 3–5 фичей из MVP пакета для Wave 1 и согласование acceptance criteria с владельцем.

---

---

# 11. AI И АВТОМАТИЗАЦИЯ (advanced)

### 11.1 AI assistant для CEO
- **Зачем:** CEO спрашивает "почему выручка упала в филиале Б" и получает ответ с цифрами + гипотезой.
- **Проблема:** CEO тратит часы на сводки, которые LLM может собрать за минуту.
- **Сложность:** H. Нужен reporting layer.
- **UX:** чат-виджет справа от dashboard. Готовые вопросы.
- **Backend:** `AiModule`, LLM-провайдер, context-builder.
- **Frontend:** `<AiChat>` компонент, persist истории.
- **DB:** `AiInsight` + `AiChatHistory`.
- **Scale:** средне (один CEO редко спрашивает).
- **Monetization:** премиум-тариф SaaS.
- **Priority:** **P2**.

### 11.2 AI assistant для менеджеров
- **Зачем:** быстрое summary по лиду: "Кто звонил, когда, что говорил" + рекомендация как действовать.
- **Проблема:** менеджер держит историю в голове, проигрывает при сменах.
- **Сложность:** H.
- **UX:** на странице лида — блок "AI-анализ".
- **Monetization:** Premium tier.
- **Priority:** **P2**.

### 11.3 AI summary по филиалам
- **Зачем:** ежемесячный отчёт "что произошло в филиале" автогенерация.
- **Сложность:** M (после reporting).
- **Priority:** **P2**.

### 11.4 AI прогноз оттока студентов
- **Зачем:** предсказать кто уйдёт за 30 дней.
- **Проблема:** ручной отсев слишком поздний.
- **Сложность:** H (нужна модель + обучение на исторических данных).
- **UX:** в списке студентов — колонка "Churn risk" с цветом.
- **Backend:** batch-inference через cron, сохранение в `AiPrediction`.
- **Scale:** высоко.
- **Monetization:** core value proposition для SaaS.
- **Priority:** **P2**.

### 11.5 AI анализ посещаемости
- **Зачем:** паттерны "группа А стабильно пропускает четверги".
- **Сложность:** M.
- **Priority:** **P3**.

### 11.6 AI рекомендации по расписанию
- **Зачем:** оптимизация загрузки менторов и кабинетов.
- **Сложность:** H (комбинаторика + ML).
- **Priority:** **P3**.

### 11.7 AI генерация сообщений родителям
- **Зачем:** персонализированное сообщение вместо шаблона.
- **Сложность:** M.
- **Риск:** высокий (AI может сгенерировать странное — нужна модерация).
- **Priority:** **P3**.

### 11.8 AI проверка эффективности менторов
- **Зачем:** "Ментор X: посещаемость 92%, средняя оценка 4.5, retention 87% — top-3 в сети".
- **Сложность:** M (после reporting).
- **Priority:** **P2**.

### 11.9 AI финансовые прогнозы
- **Зачем:** прогноз выручки на месяц вперёд.
- **Сложность:** H (timeseries).
- **Priority:** **P3**.

### 11.10 AI выявление проблемных студентов
- **Зачем:** совмещение attendance + grades + debt + behavior → флаг "нужно вмешательство".
- **Сложность:** H.
- **Priority:** **P2**.

---

# 12. TELEGRAM ECOSYSTEM

### 12.1 Telegram mini app для студентов
- **Зачем:** вход через Telegram, без отдельного приложения.
- **UX:** открывается внутри Telegram, auth через `initData`.
- **BE:** HMAC-проверка, `TelegramLink`.
- **FE:** отдельный `tg-app/` в роутах.
- **DB:** `TelegramLink`.
- **Scale:** высоко (все пользуются TG в регионе).
- **Monetization:** включено в базовый продукт.
- **Priority:** **P1**.

### 12.2 Telegram mini app для родителей
- То же, но с фокусом "несколько детей, оплатить за ребёнка".
- **Priority:** **P1**.

### 12.3 Telegram mini app для менторов
- Отметка посещаемости, комментарии, замены.
- **Priority:** **P2**.

### 12.4 Telegram login (для сотрудников)
- Вместо OTP по SMS — login через Telegram WebApp кнопку.
- **Priority:** **P2**.

### 12.5 Telegram notifications
- Как канал в Notification Hub.
- **Priority:** **P0** (после Hub).

### 12.6 Telegram attendance confirm
- Родитель подтверждает через inline-кнопки.
- **Priority:** **P2**.

### 12.7 Telegram homework
- Сдача фотографии задания в бот.
- **Priority:** **P2**.

### 12.8 Telegram balance / payment
- Оплата через Telegram Payments (deep-link на Click/Payme).
- **Priority:** **P1**.

### 12.9 Telegram support chat
- Встроенная поддержка внутри Telegram.
- **Priority:** **P3**.

---

# 13. MOBILE-FIRST FEATURES

### 13.1 PWA
- manifest + SW + install prompt.
- **Complexity:** M | **Monetization:** opens mobile audience.
- **Priority:** **P1**.

### 13.2 Offline mode
- read-only кеш (посещаемость, расписание).
- **Complexity:** H.
- **Priority:** **P2**.

### 13.3 Push notifications
- VAPID + backend sender.
- **Priority:** **P1**.

### 13.4 Mobile dashboard
- отдельные компактные виджеты для карманного режима.
- **Priority:** **P2**.

### 13.5 QR attendance
- Ментор показывает QR — студенты сканят в Telegram Mini App → отметка.
- **UX:** большой QR на экране → быстрая отметка всего класса.
- **Priority:** **P1**.

### 13.6 Camera scan
- Сканирование документов студентов, ID.
- **Priority:** **P3**.

### 13.7 Mobile payments
- Payments API через мобильный поток (Click/Payme deep-links).
- **Priority:** **P1**.

---

# 14. ANALYTICS & BI

### 14.1 Branch analytics
- Метрики по филиалам.
- **Priority:** **P1**.

### 14.2 Mentor efficiency analytics
- KPI ментора по retention, attendance, average grade.
- **Priority:** **P1**.

### 14.3 Student LTV
- Сколько студент приносит за всё время.
- **Priority:** **P2**.

### 14.4 Retention analytics
- Cohort retention.
- **Priority:** **P2**.

### 14.5 Churn analytics
- Кто ушёл и почему.
- **Priority:** **P2**.

### 14.6 Payment heatmaps
- Когда платят, пик-дни, процент задержек.
- **Priority:** **P2**.

### 14.7 Attendance heatmaps
- Какие дни/часы проседают.
- **Priority:** **P2**.

### 14.8 Financial forecasting
- ML-прогноз на 1/3 месяца.
- **Priority:** **P3**.

### 14.9 Custom reports builder
- Drag-and-drop конструктор отчётов.
- **Complexity:** H | **Priority:** **P3**.

---

# 15. GAMIFICATION

### 15.1 Student рейтинг
- Очки за посещаемость, оценки, выполненные задания.
- **Priority:** **P2**.

### 15.2 Achievements
- "10 уроков без пропусков", "5 пятёрок подряд".
- **Priority:** **P2**.

### 15.3 Streaks
- Серия посещений подряд.
- **Priority:** **P2**.

### 15.4 XP system
- Общая шкала прогресса.
- **Priority:** **P3**.

### 15.5 Leaderboard
- Внутри группы/филиала.
- **Priority:** **P2**.

### 15.6 Mentor рейтинги
- На основе KPI.
- **Priority:** **P3**.

### 15.7 Rewards system
- Обменять XP на мерч / скидку.
- **Priority:** **P3**.

### 15.8 Бонусы за посещаемость
- Скидка на следующий месяц при 95%+ посещаемости.
- **Priority:** **P2**.

---

# 16. ENTERPRISE FEATURES

### 16.1 Multi-tenant architecture
- Полноценное SaaS с tenant isolation.
- **Complexity:** H+ | **Priority:** **P3** (для текущего бизнеса — future).

### 16.2 Network of education centers
- Франшизная сеть, центральное управление.
- **Priority:** **P3**.

### 16.3 Franchise management
- Настройки per-franchise, отчётность parent tenant.
- **Priority:** **P3**.

### 16.4 Branch isolation
- Усилить текущее — через AsyncLocalStorage context.
- **Priority:** **P1**.

### 16.5 Centralized analytics (для сети)
- BI по всем франшизам.
- **Priority:** **P3**.

### 16.6 White-label mode
- Брендинг per-tenant.
- **Priority:** **P3**.

### 16.7 Permissions matrix
- Гранулярный RBAC.
- **Priority:** **P2**.

### 16.8 Audit logs (enterprise-grade)
- С retention + экспорт.
- **Priority:** **P0** (базовый) → **P1** (enterprise).

### 16.9 Activity timeline
- По любой сущности — timeline событий.
- **Priority:** **P1**.

---

# 17. EDUCATION FEATURES

### 17.1 Homework system
- **Priority:** **P1**.

### 17.2 Online exams
- Тесты с автопроверкой.
- **Priority:** **P2**.

### 17.3 Certificates
- Генерация сертификата о прохождении курса (PDF + QR для верификации).
- **Priority:** **P2**.

### 17.4 Grading system
- Расширенный gradebook.
- **Priority:** **P2**.

### 17.5 Progress tracking
- По модулям/темам курса.
- **Priority:** **P2**.

### 17.6 Lesson materials
- PDF, ссылки, видео — привязанные к уроку/курсу.
- **Priority:** **P1**.

### 17.7 Video lessons
- Загрузка или ссылка на YouTube/Vimeo.
- **Priority:** **P2**.

### 17.8 File uploads
- В S3.
- **Priority:** **P1**.

### 17.9 Comments / reviews
- Студент может оставить отзыв о курсе/менторе.
- **Priority:** **P2**.

---

# 18. PAYMENT FEATURES

### 18.1 Click integration
- Click uz — популярный шлюз.
- **Complexity:** M | **Priority:** **P1**.

### 18.2 Payme integration
- Аналогично Click.
- **Priority:** **P1**.

### 18.3 Subscription payments
- Автооплата подписки на курс.
- **Priority:** **P2**.

### 18.4 Auto recurring payments
- Для рассрочки.
- **Priority:** **P1** (после Click/Payme).

### 18.5 Installment plans
- **Priority:** **P1**.

### 18.6 Online invoices
- Ссылка на оплату отправляется через SMS/Telegram.
- **Priority:** **P1**.

### 18.7 Payment links
- Уникальные короткие ссылки.
- **Priority:** **P1**.

### 18.8 QR payments
- QR на кассе → скан → оплата через мобильный банк.
- **Priority:** **P2**.

### 18.9 Cashier dashboard
- Киоск-режим для секретаря.
- **Priority:** **P2**.

---

# 19. STAFF MANAGEMENT

### 19.1 KPI dashboard
- **Priority:** **P1**.

### 19.2 Salary constructor
- **Priority:** **P3**.

### 19.3 Mentor workload
- Нагрузка в часах/неделю + предупреждения о перегрузе.
- **Priority:** **P2**.

### 19.4 Work schedule
- Расписание смен сотрудников.
- **Priority:** **P2**.

### 19.5 Shift planner
- Drag-and-drop планер.
- **Priority:** **P3**.

### 19.6 Vacation management
- Учёт отпусков и больничных.
- **Priority:** **P2**.

### 19.7 Penalties / bonuses automation
- Авто-штраф за опоздание, авто-бонус за перевыполнение.
- **Priority:** **P2**.

---

# 20. SECURITY & ADMIN

### 20.1 Session management
- **Priority:** **P1**.

### 20.2 Device management
- **Priority:** **P1**.

### 20.3 IP history
- **Priority:** **P2**.

### 20.4 Suspicious login detection
- Новый город / новое устройство → email/Telegram alert.
- **Priority:** **P2**.

### 20.5 Admin action logs
- Подмножество Audit log для действий admin.
- **Priority:** **P1**.

### 20.6 Backup manager
- Расписание + ручной trigger + retention.
- **Priority:** **P1**.

### 20.7 Restore snapshots
- Визуальный restore (опасно — только CEO).
- **Priority:** **P3**.

---

# 21. PERFORMANCE & SCALE

### 21.1 WebSocket realtime updates
- Dashboard + attendance.
- **Priority:** **P2**.

### 21.2 Queue system
- BullMQ.
- **Priority:** **P0**.

### 21.3 Redis cache
- **Priority:** **P0**.

### 21.4 Background jobs
- Через BullMQ.
- **Priority:** **P0**.

### 21.5 CDN strategy
- Cloudflare / DigitalOcean CDN для S3.
- **Priority:** **P2**.

### 21.6 Image optimization
- sharp + responsive sizes.
- **Priority:** **P2**.

### 21.7 Lazy loading
- FE code-splitting.
- **Priority:** **P1**.

### 21.8 Modular backend architecture
- Уже модульный NestJS. Усилить через ports/adapters.
- **Priority:** **P2**.

---

# 22. UX IMPROVEMENTS

### 22.1 Command palette
- ⌘K / Ctrl+K — поиск и быстрые действия.
- **Priority:** **P1**.

### 22.2 Global search
- Студенты, лиды, транзакции, уроки.
- **Priority:** **P1**.

### 22.3 Quick actions
- На карточках — быстрые действия (отметить, отправить sms).
- **Priority:** **P2**.

### 22.4 Keyboard shortcuts
- Для power-users (CEO, manager).
- **Priority:** **P2**.

### 22.5 Smart filters
- Предсохранённые фильтры + AI-предложения.
- **Priority:** **P2**.

### 22.6 Saved filters
- Сохранение набора фильтров в URL + в user settings.
- **Priority:** **P2**.

### 22.7 Bulk actions
- "Отметить 20 лидов как refused", "SMS 50 должникам".
- **Priority:** **P1**.

### 22.8 Drag-and-drop scheduling
- Перетаскивание уроков в расписании.
- **Priority:** **P2**.

---

# 23. AUTOMATIONS

### 23.1 Automatic debt reminders
- Cron: за 3 дня, 1 день, в день, через день после.
- **Priority:** **P1**.

### 23.2 Automatic mentor salary generation
- Уже есть cron 10-го числа, сделать прозрачным + аудит.
- **Priority:** **P1**.

### 23.3 Automatic reports
- Monthly report CEO email.
- **Priority:** **P2**.

### 23.4 Automatic student status updates
- Посещаемость < 50% → ментор уведомлён.
- **Priority:** **P2**.

### 23.5 Automatic branch KPI calculation
- Ежедневный nightly job.
- **Priority:** **P1**.

### 23.6 Automatic attendance alerts
- Пропустил 3 урока подряд → менеджер получает уведомление.
- **Priority:** **P1**.

---

# 24. MARKETPLACE / ECOSYSTEM

### 24.1 Mentor marketplace
- Каталог репетиторов + бронирование.
- **Priority:** **P3**.

### 24.2 Online booking
- Родитель бронирует пробный урок.
- **Priority:** **P2**.

### 24.3 Parent portal
- Самостоятельный портал (web + Telegram).
- **Priority:** **P1**.

### 24.4 Integrations marketplace
- Список доступных интеграций (1C, Click, Payme, Google Calendar, Zoom).
- **Priority:** **P3**.

### 24.5 Plugin system
- Hot-loadable модули.
- **Priority:** **P3**.

### 24.6 Public API access
- Для третьих сторон (лендинги, боты, интеграции).
- **Complexity:** H | **Priority:** **P3**.

---

# TOP 20 MOST POWERFUL FEATURES

Отобраны по балансу: бизнес-ценность × конкурентоспособность × сложность × ROI. Это фичи, которые превращают проект из локальной админки в полноценный SaaS LMS/CRM.

| # | Фича | Категория | Почему это powerful |
|:-:|------|-----------|---------------------|
| 1 | **Notification Hub + шаблоны + Telegram-канал** | Notifications | Основа для 80% автоматизаций |
| 2 | **Telegram Mini App для родителей** (баланс, расписание, оплата) | Telegram | Снимает 50% звонков на менеджеров |
| 3 | **Online payments (Click/Payme) + рассрочка + auto-reminders** | Finance | Прямой рост конверсии на 20-30% |
| 4 | **Dashboard CEO** с branch metrics + KPI + AI-summary | Analytics + AI | CEO принимает решения по цифрам |
| 5 | **Воронка лидов (Kanban) + задачи + конверсия** | CRM | Превращает систему в полноценный CRM |
| 6 | **AI-прогноз churn + debt + problem students** | AI | Proactive management — USP SaaS |
| 7 | **Domain-first Audit log + session management + device history** | Security | Enterprise-grade security |
| 8 | **Homework system + gradebook + сертификаты** | LMS | Полноценный LMS-функционал |
| 9 | **Экспорт Excel/PDF + конструктор отчётов** | Reporting | Удовлетворяет accounting/regulator требования |
| 10 | **Mobile-first journal посещаемости + QR-attendance** | Mobile | Ментор работает на телефоне — массовое принятие |
| 11 | **Parent cabinet (Telegram или web)** с push | Parent Portal | Родитель — новый активный пользователь |
| 12 | **Gamification студентов (рейтинги, achievements, streaks)** | Gamification | Retention |
| 13 | **WebSocket realtime updates (dashboard, attendance)** | Performance | Ощущение современного продукта |
| 14 | **Automation engine (triggers + actions)** | Automation | "Если долг > 3 дней → SMS + задача менеджеру" |
| 15 | **Feature flags + A/B-тесты** | Admin | Безопасное внедрение новых фич |
| 16 | **Command palette + global search + bulk actions** | UX | Power-users работают в 3x быстрее |
| 17 | **Mentor KPI dashboard + workload planner** | Staff | CEO видит топ/анти-топ менторов |
| 18 | **Role & Permission editor (granular RBAC)** | Security/Admin | Готовность к enterprise |
| 19 | **Multi-tenant foundation + white-label** | Enterprise | Открывает франчайзинг как бизнес-модель |
| 20 | **Public API + plugin system** | Ecosystem | Превращает продукт в платформу |

---

## Резюме

Сейчас у вас локальный LMS/CRM. Путь к SaaS-продукту регионального масштаба:

**Фаза 1 (Фундамент, 1-2 месяца):** Security, Notifications, Audit, S3, Redis, Queues.
**Фаза 2 (Product-market fit, 2-4 месяца):** Telegram Mini App, Online payments, Воронка лидов, Parent cabinet, Экспорты.
**Фаза 3 (Competitive edge, 4-8 месяцев):** AI-слой, BI-дашборды, Gamification, Realtime, Automation engine.
**Фаза 4 (Platform, 8+ месяцев):** Multi-tenant, White-label, API, Plugin system, Marketplace.

Код пока не пишем. Следующий шаг — утверждение приоритетов и acceptance criteria для Wave 1 (см. `FEATURE_IMPLEMENTATION_MASTERPLAN.md`).
