#tequila UML diagram

## Diagram
![yuml graphic](http://yuml.me/9c071efa)

## yUML text
```
[Application{bg:palegreen}]
[Application]uses -.->[Presentation]
[Application]uses -.->[Log]
[Application]uses -.->[User]
[Attribute{bg:cornsilk}]
[Bootstrap3{bg:deepskyblue}]
[CLI{bg:deepskyblue}]
[PDF{bg:deepskyblue}]
[Command{bg:cornsilk}]
[Command]uses -.->[Presentation]
[Command]uses -.->[Procedure]
[Delta{bg:cornsilk}]
[Delta]uses -.->[Model]
[Interface{bg:powderblue}]
[Interface]uses -.->[Model]
[Interface]uses -.->[List]
[Interface]uses -.->[Command]
[Presentation]uses -.->[Interface]
[Interface]^-[CLI]
[Interface]^-[PDF]
[Interface]^-[Bootstrap3]
[List{bg:cornsilk}]
[List]uses -.->[Model]
[Log{bg:palegreen}]
[Memory{bg:orange}]
[Message{bg:cornsilk}]
[Model{bg:cornsilk}]
[Model]uses -.->[Attribute]
[Model]^-[Application]
[Model]^-[Log]
[Model]^-[Presentation]
[Model]^-[User]
[Mongo{bg:orange}]
[Procedure{bg:cornsilk}]
[Procedure]uses -.->[Command]
[Presentation{bg:palegreen}]
[Presentation]uses -.->[Model]
[Remote{bg:orange}]
[Remote]uses -.->[Transport]
[Store{bg:bisque}]
[Store]uses -.->[Model]
[Store]uses -.->[List]
[Store]uses -.->[Workspace]
[Store]^-[Memory]
[Store]^-[Mongo]
[Store]^-[Remote]
[Transport{bg:cornsilk}]
[Transport]uses -.->[Message]
[User{bg:palegreen}]
[Workspace{bg:cornsilk}]
[Workspace]uses -.->[Delta]
[Workspace]uses -.->[User]
```



## Info
This file houses UML markup for class design.  For help on notation see http://yuml.me/diagram/class/samples.  There is
a CLI project in git but for now just cut and paste into http://yuml.me/diagram/scruffy/class/draw.
Colors: http://en.wikipedia.org/wiki/X11_color_names
