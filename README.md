# Email Engine Core

# Prerequisites

To run the completed project in this folder, you need the following:

    Node.js installed on your development machine. If you do not have Node.js, visit the previous link for download options.
    Either a personal Microsoft account with a mailbox on Outlook.com, or a Microsoft work or school account.

# Register a web application with the Azure Active Directory admin center

    1. Open a browser and navigate to the Azure Active Directory admin center. Login using a personal account (aka: Microsoft Account) or Work or School Account.

    2. Search Microsoft Entra ID in the search field. Select manage in the left-hand navigation, then select App registrations under Manage.

    3. Select New registration. On the Register an application page, set the values as follows.

        Set Name to Email Engine Core.
        Set Supported account types to Accounts in any organizational directory and personal Microsoft accounts.
        Under Redirect URI, set the first drop-down to Web and set the value to http://localhost:3000/api/auth/outlook/callback.

    4. Choose Register. On the Email Engine Core page, copy the value of the Application (client) ID and save it, you will need it in the next step.

    5. Select Certificates & secrets under Manage. Select the New client secret button. Enter a value in Description and select one of the options for Expires and choose Add.

    6. Copy the client secret value before you leave this page. You will need it in the next step.
    7. Go to API permissions in your Email Engine Core and select the Microsoft Graph. You need to select the delegate permission option here. Please set these API permissions:

    - User.Read,Calendars.ReadWrite,MailboxSettings.Read,Mail.Read,Mail.ReadWrite,openid,profile,offline_access

# Configure the Application

1. cp docker-compose.example.yml docker-compose.yml

- Replace environment variables values with the actual values.

2. Run the docker-compose file using docker-compose up --build. It will install the elasticsearch and run the app in the container
3. Go to src/config directory by using this command cd src/config and run node elasticsearch.js
4. Open a browser and browse to http://localhost:3000
