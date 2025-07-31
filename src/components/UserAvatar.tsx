interface Props {
  name: string;
  avatar?: string | null;
}

export default function UserAvatar({ name, avatar }: Props) {
  return avatar ? (
    <img
      src={`https://circle-app-be-production.up.railway.app${avatar}`}
      alt={name}
      className="w-7 h-7 rounded-full object-cover border-2 border-blue-500"
    />
  ) : (
    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
