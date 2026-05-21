import {
  validateEmail,
  validatePhone,
  sanitizeInput
} from "../../utils/validation";
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);