# 🔧 Настройка GitHub CLI для gorelikspb

## 1. Установка GitHub CLI

**Автоматическая установка (AI-ассистент):**
AI-ассистент может автоматически установить GitHub CLI при необходимости:
```powershell
winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
```

**Ручная установка (Windows через winget):**
```powershell
winget install --id GitHub.cli
```

**Или скачайте:** https://cli.github.com/

## 2. Авторизация

```powershell
gh auth login
```

Выберите:
- **GitHub.com**
- **HTTPS**
- **Yes** для аутентификации через браузер
- **Login with a web browser**
- Скопируйте код и вставьте в браузере

## 3. Проверка

```powershell
gh auth status
```

Должно показать: `Logged in to github.com as gorelikspb`

## 4. Готово!

Теперь можно использовать:
- `gh repo create` - создать репозиторий
- `git push` - пушить код (автоматически использует gh)

## 4.1 Как AI-ассистент делает push

⚠️ **Предпосылка:** GitHub CLI (`gh`) уже установлен и авторизован (как описано выше). На этом проекте ассистент работал именно в такой конфигурации — gh был установлен заранее, поэтому дополнительных шагов не требовалось.

Когда нужно автоматически закоммитить и запушить изменения, ассистент выполняет одинаковый набор команд (подходит и вам — хорошая "шпаргалка"):

```powershell
# 1. Проверить статус
git status -sb

# 2. Добавить нужные файлы
git add <files...>
# или просто всё:
git add .

# 3. Сделать коммит
git commit -m "Краткое описание изменений"

# 4. Запушить
git push
```

Если первый пуш идёт в новый репозиторий, достаточно сделать `git push -u origin master` (или main). После привязки GitHub CLI эти команды работают без дополнительных настроек — токен берётся из `gh auth login`.

## 5. Автоматизация для AI-ассистента

**Предпочтение**: AI-ассистент должен автоматически устанавливать GitHub CLI при необходимости, если он не установлен.

**Команда для установки:**
```powershell
winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
```

**После установки может потребоваться:**
- Перезапуск терминала или обновление PATH
- Авторизация через `gh auth login`

---

**Ваш аккаунт:** `gorelikspb`  
**GitHub:** https://github.com/gorelikspb

---

## 6. Если `gh` недоступен: ручной push через HTTPS

1. **Создай репозиторий на GitHub вручную**
   - Перейди в браузере на https://github.com/new
   - Задай имя (например, `printacopy`)
   - Оставь «Initialize with README» выключенным (репозиторий уже существует локально)
   - Нажми **Create repository**

2. **Скопируй HTTPS-URL репозитория**, например:
   ```
   https://github.com/gorelikspb/printacopy.git
   ```

3. **Привяжи удалённый репозиторий локально**:
   ```powershell
   cd D:\dev\printacopy
   git remote add origin https://github.com/gorelikspb/printacopy.git
   git branch -M main   # если нужно переименовать текущую ветку
   ```

4. **Подготовь коммит**:
   ```powershell
   git status -sb
   git add .
   git commit -m "Initial commit"
   ```

5. **Сделай push**:
   ```powershell
   git push -u origin main
   ```
   - Git запросит логин и пароль.
   - В поле «username» введи `gorelikspb`.
   - В поле «password» вставь персональный токен GitHub (PAT). Создать/посмотреть токен можно в https://github.com/settings/tokens (Classic token c правами `repo`).

После этого все дальнейшие `git push`/`git pull` будут работать через HTTPS + сохранённый токен (если отметишь «save credentials» в менеджере учетных данных Windows).

