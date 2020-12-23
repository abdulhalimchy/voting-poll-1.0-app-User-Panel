# Voting-Poll-1.0-App-User-Panel
Web Page: https://voting-poll-app.herokuapp.com/

## Description
The “Voting Poll” is a web application which is built for online voting system. This system can be used for minor election or to get others’ opinion about any matter and also share their opinion with others. *This repository is containing source code of user panel only*

### Features
#####  For User:
* User registration with email verification
* User login/logout
* User can create a poll
* Can edit their poll
* Can delete their poll
* User can open poll for voting & can close poll temporarily for voting
* When voting is done, user can end voting session permanently
* Can publish poll as global or Unpublish poll from global
* Share poll via link
* Submit poll opinion
* Can change poll opinion before voting session has ended
* Real time poll result (percentage, no. of votes, pie chart)
* Can view his own created polls
* Can view the poll list that he/she participated
* Can search polls
* Can discover poll from global polls
* Can view his own poll’s response list (voter’s information)
* Can view profile of poll creator
* User can upload and update profile picture
* User can update email, username, name and password
* User can reset password through email link
* User can send message to admin
<hr>

##### For Super Admin:
* Can add new admin/super admin
* New admin needs to verify email address & set password before proceeding to the dashboard
* Can view user list
* Can search user by name, email or username
* Can block/unblock user account
* Can view poll list
* Can search poll
* Can delete poll
* Can view messages
* Can identify read/unread messages
* Can search messages
* Can reply message directly from dashboard to user email
* Can see old replies of messages
* Can delete a message
* Can add/delete F.A.Q
* Can view admin/super admin list
* Can search admin by name, email, role
* Super admin can delete admin/other super admin
* Can upload or update profile image
* Can change account password
* User can reset password through email link
<hr>

#####  For Admin:
* An admin can do everything what super admin can do except add/delete an admin

<hr>

### Activiy Diagram of User
![alt text](https://i.ibb.co/7nKq4m2/voting-poll-activity-diagram-of-user.png)

<hr>

### Activiy Diagram of Admin
![alt text](https://i.ibb.co/f2tdr6F/voting-poll-activity-diagram-admin-final.png)

<hr>

### ER Diagram
![alt text](https://i.ibb.co/r7Dbkw4/voting-poll-erd-final.png)


## Install Dependencies

    npm install

## Cloudinary Cloud to store user image
https://cloudinary.com/
setup cloudinary account to store user image

## .env file
Setup .env file
```
MONGO_DB_URI=<Enter_Database_URI>
BASE_URL=<Enter_Base_Url>
SEND_MAIL_FROM=<Enter_Email_Address>
MAIL_PASSWORD=<Enter_Email_Password>
JWT_SECRET_KEY=<Enter_Secret_Key>
CLOUDINARY_CLOUD_NAME=<Cloud_Name>
CLOUDINARY_API_KEY=<Api_Key>
CLOUDINARY_API_SECRET=<Api_Secret>
CLOUDINARY_FOLDER_NAME=<Folder_Name>
```

## Run
```
npm start
		or
npm run dev
```