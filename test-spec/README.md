# tequila test spec

## todo
- [ ] create test runner
- [ ] port tgiCloud tests

## test syntax
- **test.start(options)** Starts gathering test cases until stop hit.
  - **options.verbose** = true for debugging tests
- **test.heading(text,function)** Header for grouping
- **test.paragraph(text)**  Additional Verbiage
- **test.example(text, test function, expect)** test with expected results
- **test.exception(text, test function, Error)** test that expect exception to be thrown
- **test.stop()** end of test specs
- **test.run(resultsCallback)** execute tests
- **test.render(options)** render test results

# This is an <h1> tag
## This is an <h2> tag
###### This is an <h6> tag

*This text will be italic*
_This will also be italic_
**This text will be bold**
__This will also be bold__
*You **can** combine them*
* Item 1
* Item 2
  * Item 2a
  * Item 2b

1. Item 1
2. Item 2
3. Item 3
   * Item 3a
   * Item 3b

![GitHub Logo](/images/logo.png)
Format: ![Alt Text](url)

http://github.com - automatic!
[GitHub](http://github.com)

```javascript
function fancyAlert(arg) {
  if(arg) {
    $.facebox({div:'#foo'})
  }
}
```

I think you should use an
`<addr>` element here instead.

As Kanye West said:

> We're living the future so
> the present is our past.


- [ ] a task list item
- [ ] list syntax required
- [ ] normal **formatting**,
      @mentions, #1234 refs
- [ ] incomplete
- [x] completed


Here is a Python code example
without syntax highlighting:

    def foo:
      if not bar:
