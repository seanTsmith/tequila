#tequila UML diagram

## Diagram
![yuml graphic](http://yuml.me/d34b9010)


## yUML text
```
[Application{bg:green}]
[Application]uses -.->[Command]
[Application]uses -.->[User]
[Application]uses -.->[Interface]
[Application]uses -.->[Store]
[Application]uses -.->[Workspace]
[Application]uses -.->[Log]
[Attribute{bg:yellow}]
[Bootstrap3{bg:lightskyblue}]
[Cli{bg:lightskyblue}]
[Command{bg:yellow}]
[Command]uses -.->[Presentation]
[Command]uses -.->[Procedure]
[Delta{bg:yellow}]
[Delta]uses -.->[Model]
[Interface{bg:yellow}]
[Interface]uses -.->[Model]
[Interface]uses -.->[List]
[Interface]uses -.->[Presentation]
[Interface]^-[Cli]
[Interface]^-[Bootstrap3]
[List{bg:yellow}]
[List]uses -.->[Model]
[Log{bg:green}]
[Memory{bg:orange}]
[Message{bg:yellow}]
[Model{bg:yellow}]
[Model]uses -.->[Attribute]
[Model]^-[Application]
[Model]^-[Log]
[Model]^-[Presentation]
[Model]^-[User]
[Mongo{bg:orange}]
[Procedure{bg:yellow}]
[Procedure]uses -.->[Command]
[Presentation{bg:green}]
[Remote{bg:orange}]
[Remote]uses -.->[Transport]
[Store{bg:yellow}]
[Store]uses -.->[Model]
[Store]uses -.->[List]
[Store]uses -.->[Workspace]
[Store]^-[Memory]
[Store]^-[Mongo]
[Store]^-[Remote]
[Transport{bg:yellow}]
[Transport]uses -.->[Message]
[User{bg:green}]
[Workspace{bg:yellow}]
[Workspace]uses -.->[Delta]
[Workspace]uses -.->[User]
```

## Info
This file houses UML markup for class design.  For help on notation see http://yuml.me/diagram/class/samples.  There is
a CLI project in git but for now just cut and paste into http://yuml.me/diagram/scruffy/class/draw.
Colors: http://en.wikipedia.org/wiki/X11_color_names
