# IndexedDB
ConstraintError in indexedDB when simultaneously writing from foreground and background.

This repo is part of [this question](https://social.msdn.microsoft.com/Forums/en-US/e8fd4ae5-b9dc-439d-9cbf-ee964dbed6af) at MSDN forums. In case the link ever dies, this is that question:

**Background**

We have a Windows 8.1 app in which both the foreground app and background tasks can write to a table in an IndexedDB. All works fine there. When porting this app to Windows 10, we observe occasional crashes due to ConstrainErrors (i.e., duplicate keys).

**Isolated issue**

I created a small sample app to isolate the problem, where I did the following:

* Create an IndexedDB with a single store, having autoincrement=true.
* Trigger a background task that starts writing to this store at 200ms intervals. I don't specify the key explicitly, so it makes use of the auto-incrementing.
* Start writing from the foreground app into the same store. Again, I don't specify the key explicitly, so it makes use of the auto-incrementing.
* I observe occasional ConstraintErrors (= duplicate keys) even though all keys are generated by IndexedDB itself.
* The source of this sample app is available from Github (https://github.com/vincentvanderweele/IndexedDB).

**Question**

I would expect that IndexedDB (and definitely auto-incrementing keys) is thread-safe - I couldn't find a specification that it is not. So, is this is bug in Windows 10 or is it defined behavior? If this is not a bug, how would I then be able to write to a database from both foreground and background? It seems that there are no other synchronization mechanisms present.