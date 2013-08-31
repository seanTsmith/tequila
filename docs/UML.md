#tequila UML diagram

## Intro
This file houses UML markup for class design.  For help on notation see http://yuml.me/diagram/class/samples.  There is
a CLI project in git but for now just cut and paste into http://yuml.me/diagram/scruffy/class/draw.

## yUML text
```
[Application]uses -.->[Command]
[Attribute]
[Command]
[Command]uses -.->[Presentation]
[Command]uses -.->[Procedure]
[Delta]
[Delta]uses -.->[Model]
[Interface]
[Interface]uses -.->[Model]
[Interface]uses -.->[Presentation]
[Interface]^-[Cli]
[Interface]^-[Bootstrap3]
[List]
[List]uses -.->[Model]
[Message]
[Model]
[Model]uses -.->[Attribute]
[Model]^-[Application]
[Model]^-[Log]
[Model]^-[Presentation]
[Model]^-[User]
[Procedure]
[Procedure]uses -.->[Command]
[Presentation]
[Remote]uses -.->[Transport]
[Store]
[Store]uses -.->[Model]
[Store]uses -.->[List]
[Store]^-[Memory]
[Store]^-[Mongo]
[Store]^-[Remote]
[Transport]
[Transport]uses -.->[Message]
[Workspace]
[Workspace]uses -.->[Delta]
[Workspace]uses -.->[User]
```

## Diagram
![yuml graphic](http://yuml.me/8388905c)
