# rabbit_middleware_example

<h1 align="center">
   Rabbit Middleware Component
</h1>

<h4 align="center">An example of a RabbitMQ middleware I have used in previous projects</a>.</h4>

<p align="center">
  <a href="#background">Background</a> •  
  <a href="#more-info">More Info</a> •  

</p>


## Background
* This component is originally taken from a personal project, where there are multiple services that communicate with each other by messasging
* There was a requirenment, to "control", or "interfere", with some of the messages before they get to the destination
* This was achieved by setting up this component, that does the following:
  - Upon instantiation, the middleare "listens" to a mutual queue for all differnet services
  - Every message that is being sent, is sent to this mutual queue, and the middleware manager is in charged <br>
  of passing it to the matching component 
  - We can interact with this middleware by its API, for example, asking to "pause system"
  - pause system will make the middleware stop transferring messages to their destination (that was the requirement)
  - we can ask the middleware again to trasnfer the messages by sending another api call ("resume system")


## More Info
* The middleware uses redis cache memory, in order to store and retrieve the relevant "status" of the system (paused or not)
* The middleware is stateless, which means we can have multiple instances of it - scaling.





