const createSession = async (req: Request, res: Response) => {
    try {
      // all socket stuff is handled here
      //creating the socket
      //creating the "session"
    } catch (error) {
      res.status(500).json({
        error: `There was an error`,
      });
    }
  };
  
  const updateSession = async (req: Request, res: Response) => {
    try {
      //get the session data that we need to update in postgres
      //sanitize data
      //patch that data into the session table ( you can use id and  username or some other identification method )
    } catch (error) {
      res.status(500).json({
        error: `There was an error`,
      });
    }
  };
  
  const joinSession = async (req: Request, res: Response) => {
    try {
      // adding a newly joined user to a session to the database entry for the session
    } catch (error) {
      res.status(500).json({
        error: `There was an error`,
      });
    }
  };
  
  const leaveSession = async (req: Request, res: Response) => {
    try {
      // removing a newly joined user to a session to the database entry for the session
    } catch (error) {
      res.status(500).json({
        error: `There was an error`,
      });
    }
  };