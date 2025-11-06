# Bank Bridge

Secure banking application with international and local payment processing, separate customer and employee portals.

## Quick Start

### Clone Repository
```bash
git clone <https://github.com/Joshua-shields/bank_bridge_st10255631_INSY.git>
cd bank_bridge_st10255631_INSY
```
## Youtube video link: https://youtu.be/5YhWiN7FKFM 

### Setup & Run

**1. Install Dependencies**
```bash
npm install
cd backend && npm install
cd ../customer && npm install
YOU NEED Node.js and MongoDB installed 
```

**2. Configure Environment**
```bash
cd backend
the env. file will run the backend 
```

**3. Start Services**
```bash
# Terminal 1 - Backend (https://localhost:3000)
cd backend
npm run dev

# Terminal 2 - Customer Portal (http://localhost:8000)
cd customer
npm start on windows its npm run start-https

or

# Terminal 3 - Employee portal (http://localhost:8001)
cd employee
npm start on windows its npm run start-https
```

## NB Make sure u run https://localhost:3000/users and accept the certificate same as https://localhost:8000

## PostMan 
GET https://localhost:3000/users
GET  https://localhost:3000/csrf-token
POST https://localhost:3000/register
POST https://localhost:3000/login
POST https://localhost:3000/forgot-password
POST https://localhost:3000/forgot-username
POST https://localhost:3000/api/mfa/setup
POST https://localhost:3000/api/mfa/verify
GET  https://localhost:3000/api/customer/transactions (requires JWT)
POST https://localhost:3000/api/payments/local-transfer (requires JWT)
POST https://localhost:3000/api/payments/transfer (requires JWT)

## Technology Stack

**Frontend**
- React 19 + Material-UI
- React Router, React Hook Form
- Axios with HTTPS

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication, bcrypt encryption
- Helmet, CSRF protection, rate limiting

**Security**
- SSL/TLS encryption
- Password hashing (bcrypt)
- Data encryption (AES)
- Multi-factor authentication (TOTP)
- CSRF tokens, rate limiting, DDoS protection

## How It Works

**Customer Flow:**
1. Register/Login → Dashboard
2. Choose transfer type (local/international)
3. Fill payment details
4. MFA verification (enabled)
5. Submit for employee approval

All sensitive data encrypted at rest, JWT tokens for authentication, HTTPS for data in transit.

## References

## Kashvir 
- Auth0 - Blog. (2018). The Not-So-Easy Art of Logging Out. [online] Available at: https://auth0.com/blog/the-not-so-easy-art-of-logging-out/. [Accessed 1 October 2025].

- Anshikasinghal (2024). Building a Secure User Authentication System: Login, Logout, and Signup Features. [online] Medium. Available at: https://medium.com/@anshikasinghal3014/building-a-secure-user-authentication-system-login-logout-and-signup-features-d2b35e7343d2 [Accessed 5 Oct. 2025].

- web.dev. (2023). What makes for a good sign-out experience? [online] Available at: https://web.dev/articles/sign-out-best-practices. [Accessed 7 October 2025].

- Owasp (2019). Input Validation OWASP Cheat Sheet Series. [online] Owasp.org. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html. [Accessed 2 October 2025].

- ProgrammingKnowledge (2024). How to Install React JS In Visual Studio Code | How to Run React JS App in VS Code. [online] YouTube. Available at: https://www.youtube.com/watch?v=i41VU2d1Emk [Accessed 7 Oct. 2025].

## Joshua

- Tshwane Institute of Technology. (2021). *INFORMATION SYSTEMS 3D INSY7314 LAB GUIDE 2025*. [Online]. Available at: https://advtechonline.sharepoint.com/:w:/r/sites/TertiaryStudents/_layouts/15/Doc.aspx?sourcedoc=%7BAB1212E5-A367-4729-B8EE-D76045935659%7D&file=INSY7314%20Lab%20Guide%202025.docx&action=default&mobileredirect=true [Accessed 23 July 2025].

- Manico, J. & Detlefsen, A. (2015). *Iron-Clad Java: Building Secure Web Applications*. [Online]. Available at: https://www.oreilly.com/library/view/iron-clad-java/9780071835886/ [Accessed 23 July 2025]. 

- Sonarsource.com. (2025). Homepage | Sonar Documentation. [online] Available at: https://docs.sonarsource.com/sonarqube-server. [Accessed 6 October 2025]

- OWASP (2012). Cross-Site Request Forgery Prevention · OWASP Cheat Sheet Series. [online] OWASP. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html. [Accessed 22 September 2025]

- Auth0 (2024). JSON Web Token Introduction - jwt.io. [online] JSON Web Tokens - jwt.io. Available at: https://www.jwt.io/introduction#what-is-json-web-token.[Accessed 19 September 2025] 

- Zanini, A. (2023). Using Helmet in Node.js to secure your application. [online] LogRocket Blog. Available at: https://blog.logrocket.com/using-helmet-node-js-secure-application/. [Accessed 18 September 2025]

- WittCode (2024). Node Password Hashing with bcrypt. [online] YouTube. Available at: https://www.youtube.com/watch?v=esa_t_-PJ6A [Accessed 19 September 2025]. 

- betterstackhq. (2025). Rate Limiting in Express.js | Better Stack Community. [online] Available at: https://betterstack.com/community/guides/scaling-nodejs/rate-limiting-express/ [Accessed 24 September 2025]. 

- OWASP (2025). Multifactor authentication - OWASP cheat sheet series. [online] cheatsheetseries.owasp.org. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html. [Accessed 26 September 2025]

## Luke

- Tshwane Institute of Technology. (2021). *INFORMATION SYSTEMS 3D INSY7314 LAB GUIDE 2025*. [Online]. Available at: https://advtechonline.sharepoint.com/:w:/r/sites/TertiaryStudents/_layouts/15/Doc.aspx?sourcedoc=%7BAB1212E5-A367-4729-B8EE-D76045935659%7D&file=INSY7314%20Lab%20Guide%202025.docx&action=default&mobileredirect=true [Accessed 23 July 2025].

- Manico, J. & Detlefsen, A. (2015). *Iron-Clad Java: Building Secure Web Applications*. [Online]. Available at: https://www.oreilly.com/library/view/iron-clad-java/9780071835886/ [Accessed 23 July 2025].  

## Annexure of AI use

## Kashvir Sewpersad

I Kashvir Sewpersad, the Student, ST10257503, hereby declare that I have made use of artificial intelligence (AI) in the creation of this project. The nature of my usage was primarily for debugging purposes and improving the quality of the work I produced. Below are links to interactions I had with the AI tools.

- https://chatgpt.com/share/68e7cdd6-dd04-8010-9fc5-5df8ef95f459
- https://chatgpt.com/share/68e7ce8f-d2c4-8010-8e4a-844b21b6f709
- https://chatgpt.com/share/68e7cf21-0ec0-8010-8234-1882dea0dc5b
- https://chatgpt.com/share/68e7cfaa-6100-8010-835a-11885c6638af
- https://chatgpt.com/share/68e7d0e0-c7c4-8010-8ffd-0991e7931fe5

## Luke
Disclosure of AI Usage in my Assessment. 
Section(s) within the assessment in which generative AI was used: logging in
Name of AI tool(s) used: Claude 
Purpose/intention behind use: debugging the crfm
Date(s) in which generative AI was used: 8 October 2025 
A link to the actual generative AI chat, or screenshots of the chat:

 https://claude.ai/share/e40299e8-814a-4d1e-a74e-ea98147ee35c*/ 


## Joshua
Disclosure of AI Usage in my Assessment. 
Section(s) within the assessment in which generative AI was used: Trying to fix token issue 
Name of AI tool(s) used: Claude 
Purpose/intention behind use: debugging the csrf token for windows users
Date(s) in which generative AI was used: 7 October 2025 
A link to the actual generative AI chat, or screenshots of the chat:
https://claude.ai/share/c9c40d16-3a98-49eb-9ea9-c8d21d6ddf13

Section(s) within the assessment in which generative AI was used: Trying to install packages
Name of AI tool(s) used: Claude 
Purpose/intention behind use: Trying to get NPM packages 
Date(s) in which generative AI was used: 1 October 2025 
A link to the actual generative AI chat, or screenshots of the chat:
https://claude.ai/share/87c4e337-d28d-4ef9-9a20-28e97172b058

Section(s) within the assessment in which generative AI was used: Trying to debug why my JWT is not working  
Name of AI tool(s) used: ChatGPT
Purpose/intention behind use: JWT issue
Date(s) in which generative AI was used: 4 October 2025 
A link to the actual generative AI chat, or screenshots of the chat:
https://chatgpt.com/share/68e7d1df-4048-8000-b3dd-91ef758282d3
