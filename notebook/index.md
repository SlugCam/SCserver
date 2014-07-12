# Introduction

SWEETnet contains all of the network software behind the SWEETcam system.

SWEETnet consists primarily of:
- A message server responsible for sending and receiving messages to the cameras.
- A video server responsible for receiving video from the clients and sending it to the clients.
- An API server providing an interface to end-user applications.

We are also developing a client web app.

- Flexible for new applications and changing protocols
- Modular so portions can be developed independently and well tested (each section with well defined interfaces)

# Milestones

In order to facilitate progress in the project we will focus on milestones as we go.

## M1 (In Progress)

- Work on the basic server structure, without worrying about security at this point. This will allow us to determine the feasibility of our approach.
- Continue research into related areas, documenting research and all work on the project.
- Build a basic end to end testing framework. (build unit tests as needed)
- Continue developing protocols for storage and communication in line while communicating with the SWEETcam team, knowing that these may change in the future.
