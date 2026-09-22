export const initialBookingState = {
  vehicleId: "",
  pickupDate: "",
  returnDate: ""
};

export function bookingReducer(state, action) {
  switch (action.type) {
    case "SELECT_VEHICLE":
      return {
        ...state,
        vehicleId: action.payload
      };

    case "SET_PICKUP_DATE":
      return {
        ...state,
        pickupDate: action.payload
      };

    case "SET_RETURN_DATE":
      return {
        ...state,
        returnDate: action.payload
      };

    case "RESET_BOOKING":
      return initialBookingState;

    default:
      return state;
  }
}