import { Dialog, Fade } from "@mui/material";
import React, { forwardRef } from "react";
const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});
function ConfirmBox({ open, closeDialog, title, deleteFunction }) {
  return (
    <Dialog
      open={open}
      maxWidth="lg"
      scroll="body"
      onClose={closeDialog}
      TransitionComponent={Transition}
    >
      <div className=" mx-auto text-center px-8 ">
        <div className="mx-auto rounded-full w-20 h-20 justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto text-white fill-primary w-18 h-18 mb-4 mt-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="w-96 mx-auto">
          <h3 className="mb-2 text-lg  text-black">
            Are you sure you want to decline ?
          </h3>
          <p className="text-gray-500 text-sm">
            If you choose confirm order #{title} will be decline{" "}
          </p>
          <p className="text-sm text-gray-500">and deleted from your order. </p>
          <div className="flex justify-center gap-2 w-full mt-5 mb-5 p-3 ">
            <button
              className="py-1 text-sm rounded w-32 text-white bg-primary hover:bg-[#0f7884] justify-center mr-5"
              onClick={deleteFunction}
            >
              Confirm
            </button>
            <button
              onClick={closeDialog}
              className="text-semibold text-sm py-1 text-center w-32 item-center rounded border border-primary  text-primary hover:bg-primary hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
export default ConfirmBox;
