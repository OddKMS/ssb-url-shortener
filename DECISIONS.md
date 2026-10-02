### Database

I opted for a proper database to ensure scalability, although the temptation to just use the local filesystem was _real_.

I ended up with using SQLite as it was a lightweight relational database (friends don't let friends use document-oriented databases).

### Dockerfile

Yet again I ended up in dependency hell, where in this case the gclib version on my computer was incompatible with the one that came with the regular "node" dockerfile. Even when re-building sqlite3 for that environment I could not get it the solution to run which I think is due to the node-dependency using its own instead of the system install.

As such, I was forced to excise a Dockerfile from a previous project that is far - FAR - overengineered but does allow for precise control over the node runtime while running on an up-to-date Linux kernel that has the correct gclib version for sqlite3 to run (and as a bonus securely runs as a rootless process).
