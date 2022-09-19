import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/EditOutlined";
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from "@material-ui/core/styles";

const defaultToolbarSelectStyles = {
  iconButton: {
    marginRight: "24px",
    display: "inline-block",
  },
  deleteIcon: {
    color: "#000",
  },
  editIcon: {
    color: "#000",
  },
};

class CustomToolbarSelect extends React.Component {
  render() {
    const { classes, buttons, disabled, data } = this.props;

    return (
      <div className={"custom-toolbar-select"}>
        {buttons.map((button, key) => {
          switch (button.type) {
            case 'add':
              return (
                <Tooltip title={button.tooltip} key={key}>
                  <span>
                    <IconButton disabled={button.disabled || disabled} className={classes.iconButton} onClick={() => button.action()}>
                      <AddIcon className={classes.deleteIcon} />
                    </IconButton>
                  </span>

                </Tooltip>
              );
            case 'update':
              return (
                <Tooltip title={button.tooltip} key={key}>
                  <span>
                    <IconButton disabled={button.disabled || disabled} className={classes.iconButton} onClick={() => button.action(data)}>
                      <EditIcon className={classes.deleteIcon} />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            case 'delete':
              return (
                <Tooltip title={button.tooltip} key={key}>
                  <span>
                    <IconButton disabled={button.disabled || disabled} className={classes.iconButton} onClick={() => button.action(data)}>
                      <DeleteIcon className={classes.deleteIcon} />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            case 'deleting':
              return (
                <Tooltip title={button.tooltip} key={key}>
                  <span>
                    <IconButton disabled className={classes.iconButton}>
                      <CircularProgress size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }
}

export default withStyles(defaultToolbarSelectStyles, { name: "CustomToolbarSelect" })(CustomToolbarSelect);