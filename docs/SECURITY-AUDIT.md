# Audit de sécurité — Tower API Monitoring

Document d’audit Phase 3 : identification des vulnérabilités, statut (ouvert / mitigé / accepté) et mesures de mitigation.

**Date** : 2026-02-27  
**Périmètre** : apps/api, apps/worker, apps/dashboard, prisma, libs

---

## Légende des statuts

| Statut   | Signification |
|----------|----------------|
| **Ouvert**  | Vulnérabilité présente ; action de mitigation recommandée. |
| **Mitigé**  | Risque réduit par une mesure existante ; surveillance recommandée. |
| **Accepté** | Risque consciemment accepté (N/A, contexte single-tenant, ou priorité basse). |

---

## 3.2 Injection

| Id    | Vulnérabilité | Contexte projet | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|-----------------|----------|--------|------------------------|
| 3.2.1 | SQL Injection | Requêtes Prisma : raw avec concaténation | Critique si raw | **Mitigé** | Aucune utilisation de `$queryRaw` / `$executeRaw` dans le code applicatif (`apps/api`, `apps/worker`). Uniquement Prisma typé (findMany, findUnique, create, update, delete). |
| 3.2.2 | NoSQL Injection | MongoDB | N/A | **Accepté** | N/A — pas de MongoDB. |
| 3.2.3 | XSS (stored/reflected) | Champs name, slug, message, description affichés | Majeur | **Mitigé** | Angular échappe par défaut les interpolations ; aucun `innerHTML` ni `bypassSecurityTrust` détecté dans le dashboard. Données affichées via binding. |
| 3.2.4 | Command / OS Injection | Worker : URL d’endpoint passée à un shell | Mineur | **Mitigé** | `httpCheck` utilise uniquement `axios({ url, method })` ; l’URL n’est jamais passée à un shell ou à `exec`. |
| 3.2.5 | LDAP / autre injection | Auth LDAP | N/A | **Accepté** | N/A — pas d’auth LDAP. |

---

## 3.3 Auth / tokens

| Id    | Vulnérabilité | Contexte projet | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|-----------------|----------|--------|------------------------|
| 3.3.1 | Absence d’authentification | Routes API publiques | Majeur | **Ouvert** | Aucune auth sur les routes. Toute personne avec accès réseau peut créer/supprimer providers et endpoints. **Recommandation** : introduire auth (API key ou rôle) pour les routes CRUD (et optionnellement lecture sensible). |
| 3.3.2 | Tokens en clair / faible stockage | Si auth ajoutée | — | **Accepté** | À traiter si auth ajoutée (pas de token dans l’URL, pas en localStorage si risque XSS). |
| 3.3.3 | Session fixation / reprise | Sessions | N/A | **Accepté** | N/A — pas de sessions. |
| 3.3.4 | Mot de passe faible / politique | Auth utilisateur | N/A | **Accepté** | N/A — pas d’auth utilisateur. |

---

## 3.4 Exposition de données

| Id    | Vulnérabilité | Contexte projet | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|-----------------|----------|--------|------------------------|
| 3.4.1 | Sur-exposition dans les réponses API | Champs inutiles ou IDs internes | Mineur | **Accepté** | Réponses dashboard/incidents/CRUD utilisent les champs métier nécessaires. Pas de fuite identifiée ; affiner si besoin (réduction de champs). |
| 3.4.2 | Messages d’erreur détaillés / stack trace | 500 avec stack ou chemins | Majeur | **Mitigé** | Middleware d’erreur centralisé (`app.ts`) : réponse 500 avec `{ code, message }` générique ; pas de stack trace dans le corps. `console.error` côté serveur logue uniquement `err.message`. |
| 3.4.3 | Logs contenant données sensibles | Body, mots de passe, tokens | Majeur | **Mitigé** | Aucun log du body des requêtes. Logs identifiés : `[api:error]` (message d’erreur), `[api-management:audit]` (action, resource, id, slug/url — pas de secret), `main.ts` (démarrage). |
| 3.4.4 | Headers révélant technologie | X-Powered-By, Server | Mineur | **Mitigé** | `app.disable('x-powered-by')` appliqué dans `app.ts`. |

---

## 3.5 CORS

| Id    | Vulnérabilité | Contexte projet | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|-----------------|----------|--------|------------------------|
| 3.5.1 | CORS trop permissif | Allow-Origin: * ou origine non vérifiée | Majeur | **Mitigé** | CORS configuré dans `app.ts` : origines autorisées = `http://localhost*` uniquement ; toute autre origine rejetée. À durcir en prod (liste explicite d’origines). |
| 3.5.2 | Credentials avec origine wildcard | Incompatible | Majeur | **Accepté** | Credentials non utilisés avec wildcard ; configuration actuelle sans `credentials: true` avec * donc N/A. |

---

## 3.6 Rate limiting

| Id    | Vulnérabilité | Contexte projet | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|-----------------|----------|--------|------------------------|
| 3.6.1 | Absence de rate limiting | DoS par flood sur /dashboard, /incidents, CRUD | Majeur | **Ouvert** | Aucun rate limiting côté API. **Recommandation** : middleware (ex. express-rate-limit) ou limite en amont (reverse proxy / WAF). |
| 3.6.2 | Limite trop haute ou par IP uniquement | Réglage | Mineur | **Accepté** | À définir lors de l’ajout du rate limiting (ex. 100 req/min par IP). |

---

## 3.7 OWASP Top 10 (référentiel)

| Id    | Catégorie | Application au projet | Sévérité | Statut |
|-------|-----------|------------------------|----------|--------|
| 3.7.1 | A01 Broken Access Control | Pas de contrôle d’accès sur API | Majeur | **Ouvert** — voir 3.3.1. |
| 3.7.2 | A02 Cryptographic Failures | Données en transit (HTTPS) | — | **Accepté** — à vérifier en prod (HTTPS obligatoire). |
| 3.7.3 | A03 Injection | Voir 3.2 | Selon 3.2 | **Mitigé** (Prisma typé, pas de raw ; Angular escape). |
| 3.7.4 | A04 Insecure Design | Suppression sans confirmation côté API | Mineur | **Mitigé** — confirmation modale côté frontend (Phase 1) ; API sans garde-fou supplémentaire. |
| 3.7.5 | A05 Security Misconfiguration | CORS, headers, messages d’erreur | Voir 3.4, 3.5 | **Mitigé** / **Ouvert** (headers). |
| 3.7.6 | A06 Vulnerable Components | Dépendances npm avec CVE | Majeur | **Ouvert** — voir 3.17. |
| 3.7.7 | A07 Auth Failures | Voir 3.3 | Majeur | **Ouvert** — pas d’auth. |
| 3.7.8 | A08 Software and Data Integrity | Signature de dépendances, CI | Mineur | **Accepté** — non défini dans le plan. |
| 3.7.9 | A09 Logging / Monitoring Failures | Logs insuffisants pour détecter abus | Majeur | **Mitigé** — logs d’audit CRUD (api-management) ; pas d’ID de requête pour corrélation. |
| 3.7.10 | A10 SSRF | Worker appelle des URLs configurées (endpoints) | Majeur si arbitraire | **Mitigé** — URLs issues de la base (endpoints) ; risque lié à l’absence d’auth sur le CRUD (création d’endpoints arbitraires). À traiter avec l’auth (3.3.1). |

---

## 3.8 Vulnérabilités logiques métier

| Id    | Vulnérabilité | Détail | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|--------|----------|--------|------------------------|
| 3.8.1 | Création provider avec slug existant | Conflit non géré → 500 ou écrasement | Majeur | **Mitigé** | Vérification `findUnique({ slug })` avant création ; retour 409 `SLUG_ALREADY_EXISTS` avec message explicite. |
| 3.8.2 | Suppression provider avec incidents actifs | Avertissement ou blocage | Mineur | **Accepté** | Cascade Prisma (suppression des incidents/endpoints) ; pas de blocage métier. Accepté pour l’instant. |
| 3.8.3 | Désactivation de tous les endpoints d’un provider | Worker ne check plus ; cohérence dashboard | Mineur | **Accepté** | Comportement attendu ; le worker ne vérifie que les endpoints actifs. |
| 3.8.4 | Ordre des opérations | Création endpoint avant provider | Mineur | **Mitigé** | Création d’endpoint uniquement via `POST /api-management/providers/:id/endpoints` ; le provider doit exister. |

---

## 3.9 IDOR

| Id    | Vulnérabilité | Contexte projet | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|-----------------|----------|--------|------------------------|
| 3.9.1 | Modification/suppression endpoint d’un autre provider | Vérifier endpoint.id vs provider dans l’URL | Majeur | **Accepté** | Modèle actuel single-tenant sans utilisateurs ; pas de notion de “propriétaire”. PUT/DELETE `/endpoints/:id` opèrent sur l’endpoint par id. Si auth multi-tenant ajoutée, ajouter une vérification d’appartenance. |
| 3.9.2 | Lecture incidents par providerId devinable | GET /incidents/:providerId | Majeur si données sensibles | **Accepté** | Données métier (incidents) non sensibles ; énumération possible. À restreindre si données sensibles ou multi-tenant. |
| 3.9.3 | Lecture latency-history par slug | Slug prédictible ; énumération | Mineur | **Accepté** | Slug prédictible ; impact limité (données de monitoring). |

---

## 3.10 Journalisation

| Id    | Vulnérabilité | Détail | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|--------|----------|--------|------------------------|
| 3.10.1 | Logs insuffisants | Pas de log des accès CRUD, échecs auth | Majeur | **Mitigé** | Logs d’audit CRUD (création/modification/suppression provider et endpoint) avec action, resource, id, détails. Pas de log des requêtes GET ni d’auth (inexistante). |
| 3.10.2 | Logs excessifs | Body complet loggé | Majeur | **Mitigé** | Aucun log du body des requêtes. |
| 3.10.3 | Pas de corrélation | Pas d’ID de requête | Mineur | **Ouvert** | **Recommandation** : ajouter un request ID (middleware) et l’inclure dans les logs structurés. |

---

## 3.11 Failles front-end

| Id    | Vulnérabilité | Détail | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|--------|----------|--------|------------------------|
| 3.11.1 | XSS via binding | Angular escape ; bypass (innerHTML, sanitizer) | Mineur | **Mitigé** | Aucun `innerHTML` ni `bypassSecurityTrust` détecté. |
| 3.11.2 | Données sensibles en localStorage/sessionStorage | Tokens, URLs internes | — | **Mitigé** | Aucune utilisation de localStorage/sessionStorage dans le dashboard. |
| 3.11.3 | Source maps en production | Exposition du code source | Mineur | **Accepté** | À vérifier en build de prod (désactiver ou restreindre l’exposition des source maps). |
| 3.11.4 | Dépendances front avec CVE | npm audit sur dashboard | Majeur | **Ouvert** — voir 3.17. |

---

## 3.12 Mauvaise gestion d’erreurs

| Id    | Vulnérabilité | Détail | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|--------|----------|--------|------------------------|
| 3.12.1 | Stack trace dans réponse API | En prod | Majeur | **Mitigé** | Réponse 500 sans stack ; message générique. |
| 3.12.2 | Messages génériques vs spécifiques | Éviter trop précis (injection) | Mineur | **Mitigé** | Messages d’erreur uniformes ; détails de validation (champs) en 400 sans exposition d’infra. |
| 3.12.3 | Non-catch des promesses | Worker et API | Majeur | **Mitigé** | Routes API enveloppées avec `asyncHandler` (rejet → middleware d’erreur). Worker : `httpCheck` en try/catch ; à vérifier ailleurs (tick, runner) si besoin. |

---

## 3.13 Fuites d’informations

| Id    | Vulnérabilité | Détail | Sévérité | Statut |
|-------|----------------|--------|----------|--------|
| 3.13.1 | Version serveur / framework dans headers | Voir 3.4.4 | Mineur | **Mitigé** — X-Powered-By désactivé. |
| 3.13.2 | Différence 404 vs 403 | Révèle existence ressource | Mineur | **Accepté** — pas d’auth donc pas de 403 pour l’instant. |
| 3.13.3 | Temps de réponse (user enumeration) | N/A sans auth user | N/A | **Accepté** |

---

## 3.14 Sécurité API

| Id    | Vulnérabilité | Détail | Sévérité | Statut | Mesure de mitigation |
|-------|----------------|--------|----------|--------|------------------------|
| 3.14.1 | Pas de versioning d’API | Breaking changes | Mineur | **Accepté** | Non traité dans le plan. |
| 3.14.2 | Pas de limite de taille body | Body JSON énorme → DoS | Majeur | **Mitigé** | `express.json({ limit: '1mb' })` appliqué dans `app.ts`. |
| 3.14.3 | Méthodes HTTP non restreintes | OPTIONS, TRACE | Mineur | **Accepté** | CORS restreint les méthodes (GET, POST, PUT, PATCH, DELETE). OPTIONS géré par CORS. |

---

## 3.15 Analyse architecturelle

| Id    | Élément | Risque | Statut |
|-------|---------|--------|--------|
| 3.15.1 | Monorepo partagé | Fuite de secrets si .env mal isolé | **Accepté** — bonne séparation des .env par app ; à surveiller. |
| 3.15.2 | Base MySQL unique | Compromission DB = tout le système | **Accepté** — risque architecturel ; mitigation classique (accès DB, réseau, sauvegardes). |
| 3.15.3 | Worker avec accès DB et HTTP | Surface d’attaque | **Accepté** — isolation à considérer (réseau, moindre privilège). |
| 3.15.4 | Pas de WAF / reverse proxy | Rate limit et filtrage | **Ouvert** — recommandation : rate limit et filtrage en amont ou dans l’app. |

---

## 3.16 Plan de mitigation (synthèse)

| Priorité | Action | Statut dans l’audit |
|----------|--------|----------------------|
| **Critique** | Aucune requête SQL raw non paramétrée ; Prisma uniquement | **Mitigé** — vérifié. |
| **Majeur** | Auth pour routes CRUD / lecture sensible | **Ouvert**. |
| **Majeur** | CORS restrictif | **Mitigé** (localhost en dev) ; durcir en prod. |
| **Majeur** | Rate limiting global | **Ouvert**. |
| **Majeur** | Ne pas exposer stack en prod | **Mitigé**. |
| **Majeur** | Ne pas logger body complet | **Mitigé**. |
| **Majeur** | Audit dépendances (npm audit) | **Ouvert** — voir 3.17. |
| **Mineur** | Réduire champs dans réponses | **Accepté** pour l’instant. |
| **Mineur** | Masquer headers serveur | **Mitigé** (x-powered-by désactivé). |
| **Mineur** | Logs structurés avec request ID | **Ouvert**. |
| **Mineur** | Limite taille body | **Mitigé** (1 Mo). |

---

## 3.17 Dépendances (npm audit)

**Résultat de `pnpm audit` (racine du monorepo) :**

- **6 vulnérabilités** : 4 high, 1 moderate, 1 low.
- **Packages concernés** : `tar` (via @angular/cli > pacote), `ajv` (via @angular-devkit/core), `tmp` (via inquirer > external-editor).
- **Contexte** : dépendances de **développement** (Angular CLI, tooling) ; pas d’impact direct sur l’exécution de l’API, du worker ou du dashboard en production.
- **Statut** : **Ouvert** — recommandation : mettre à jour les dépendances (pnpm update, ou résolution des advisories), en priorité pour les chaînes utilisées en CI/build.

---

## 3.18 Récapitulatif des statuts

| Statut   | Nombre d’éléments (ids 3.x) |
|----------|-----------------------------|
| **Ouvert**  | 8 (auth, rate limiting, request ID, CVE npm, WAF/proxy, etc.) |
| **Mitigé**  | 25 (dont headers et limite body appliqués) |
| **Accepté** | 18 |

---

## Actions recommandées (ordre de priorité)

1. **Auth** : Protéger les routes CRUD (et optionnellement lecture) par API key ou mécanisme équivalent.
2. **Rate limiting** : Middleware ou reverse proxy pour limiter le nombre de requêtes par IP.
3. **Dépendances** : Mise à jour / résolution des vulnérabilités npm (notamment chaîne Angular CLI).
4. **Request ID** : Middleware pour corrélation des logs.
5. **CORS en production** : Liste explicite d’origines autorisées (pas de localhost sauf si pertinent).

*Déjà appliqué : `app.disable('x-powered-by')`, `express.json({ limit: '1mb' })`.*

---

*Document généré dans le cadre de la Phase 3 du plan multiphase (audit de sécurité).*
