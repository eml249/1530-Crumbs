# E1: Edit booking
Students can change and cancel the study rooms they have booked. 

## US1: Cancel a booking
As a student, I want to cancel a study room reservation so that it is freed up for other students when I no longer need it.

FR: FR5, FR7, FR11, FR12 

Priority: Must 

MVP: yes 

- [ ] The student can select to cancel their current reserved room, marking it as open to book for other students.
- [ ] After a booking has just been canceled by one student; another student can reserve that same room at the same time.
- [ ] If a student is at the top of a waitlist for the room and time a booking is being canceled, they automatically claim the reservation. 

## US2: Edit booking time
As a student, I want to change the time of my study room booking so that I have it reserved for a time that better suits my availability. 

FR: FR4, FR5, FR7 

Priority: no 

MVP: no 

- [ ] The student can select a new time for their currently booked room.
- [ ] After a booking has been edited, the previous time slot for that room is now marked as free, while the new time is marked as reserved.
- [ ] A student can successfully reserve the room for the time that was just freed from the edited booking. 

## US3: Edit booked room
As a student, I want to change the room I have reserved so that I can reserve a new room that better fits my needs. 

FR: FR4, FR5, FR10 

Priority: no 

MVP: no 

- [ ] The student can select a new room for their current booked time.
- [ ] The room is marked free for that time slot after the student edits their booking.
- [ ] Another student can book that room at that time after it has been freed up. 

## US4: Filter preferences
As a student, I want to select filters when searching for a new room so that the new room matches the study room preferences I have. 

FR: FR5, FR10 

Priority: no 

MVP: yes 

- [ ] The student can select ideal capacity and room style (i.e. open or closed) filters.
- [ ] The resulting search only shows rooms that have availability at the time of the booking they are editing. 

## US5: View booking details
As a student, I want to see the room and time of my booking so that I can determine if I need to edit the booking based on my availability and space needs. 

FR: FR2, FR5 

Priority: Must 

MVP: yes 

- [ ] The student enters their Pitt credentials to view the bookings associated with their account.
- [ ] The student can view the room's location and time of their booking. 



#E2:  View Study Spaces 
Students can view available study spaces and when they are available for booking. 

##US6:  View nearby study spaces 
As a student I want to view what study spaces are available near me, so I do not have to spend time traveling to a study space. 

FR: FR1, FR2, FR6 

Priority: Should 

MVP: no

- [ ] The system is able to take the user's location, either from user input or by taking location data. 
- [ ]A list is then generated, first showing buildings closer to the user’s location. 

 

##US7: Find study spaces by time 
As a student I want to know when study spaces are available, so I know when I am able to use or reserve these spaces. 

FR: FR1, FR2 

Priority: Could 

MVP: no

- [ ]The student can choose to display a list of rooms and buildings open or available at a specific date and time. 
- [ ]An accurate list is generated, showing spaces that will be available at the time queried. 

 

##US8:  Find empty study spaces 
As a student I want to be able to find quiet study spaces that aren't congested, so I am able to find a quiet and open space where I can focus on studying. 

FR: FR1, FR2, FR3 

Priority: Must 

MVP: yes

- [ ] The system can read congestion data from popular study spaces and display it to students. 
- [ ]The student can see congestion information 

 

##US9:  Save favorite buildings 
As a student I want to be able to save the buildings I use so that I can access them more quickly and easily in the future. 

FR: FR9, FR14 

Priority: Could 

MVP: No

- [ ] The student can create and save a list of favorite buildings and study areas, and add and remove buildings or study areas to it 
- [ ]The student can access buildings from this list and modify them at a later date. 

 

U10: Sort rooms by type 
As a student I want to be able to view rooms of different types so that I can find spaces to suit my needs. (i.e. study group vs club meetings) 

FR: FR2, FR10 

Priority: Should

MVP: no

- [ ] Rooms and study spaces are stored and presented with labelled types. 
- [ ] Students can sort rooms by type and search for spaces with a specific type. 
