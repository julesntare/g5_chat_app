import { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const RoomDialog = (props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [openAway, setOpenAway] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomStatus, setRoomStatus] = useState(0);
  const handleClose = () => {
    onClose(selectedValue);
  };

  const { onClose, selectedValue, open, creator } = props;

  const handleRoomCreation = async () => {
    try {
      await axios.post("/rooms/", { name: roomName, creator });
      setRoomStatus(1);
      setRoomName("");
    } catch (err) {
      setRoomStatus(2);
      setRoomName("");
    }
  };
  const handleClickAway = () => {
    setOpenAway(false);
  };

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Dialog
          open={open}
          onClose={(event, reason) => {
            if (reason !== "backdropClick") {
              onClose(selectedValue);
            }
          }}
          aria-labelledby="form-dialog-title"
          fullScreen={fullScreen}
        >
          <DialogTitle id="form-dialog-title" onClose={handleClose}>
            Add Room
          </DialogTitle>
          <DialogContent>
            <DialogContentText></DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Room Name"
              type="text"
              fullWidth
              onChange={(e) => setRoomName(e.target.value)}
              value={roomName}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Dismiss
            </Button>
            <Button
              onClick={handleRoomCreation}
              variant="contained"
              color="primary"
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </ClickAwayListener>
      {roomStatus === 1 && (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success">
            Done!
          </Alert>
        </Snackbar>
      )}
      {roomStatus === 2 && (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error">
            Failed!
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default RoomDialog;
