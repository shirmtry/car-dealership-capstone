param([int]$BrowserProcessId, [string]$OutputPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class CapstoneWindow {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
  public delegate bool WindowCallback(IntPtr handle, IntPtr parameter);
  [DllImport("user32.dll")] public static extern bool EnumWindows(WindowCallback callback, IntPtr parameter);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr handle, out uint processId);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr handle);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr handle, out Rect rect);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr handle);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr handle, int command);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr handle, IntPtr after, int x, int y, int width, int height, uint flags);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr handle, IntPtr hdc, uint flags);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr handle, System.Text.StringBuilder text, int count);
}
'@
[CapstoneWindow]::SetProcessDPIAware() | Out-Null
$script:capstoneHandle = [IntPtr]::Zero
$script:capstoneArea = 0
$script:capstoneTitle = ''
$capstoneCallback = [CapstoneWindow+WindowCallback]{ param($handle, $parameter)
    $capstoneOwner = [uint32]0
    [CapstoneWindow]::GetWindowThreadProcessId($handle, [ref]$capstoneOwner) | Out-Null
    if ($capstoneOwner -eq $BrowserProcessId -and [CapstoneWindow]::IsWindowVisible($handle)) {
        $capstoneTitleBuffer = New-Object System.Text.StringBuilder 1024
        [CapstoneWindow]::GetWindowText($handle, $capstoneTitleBuffer, 1024) | Out-Null
        $capstoneCandidateRect = New-Object CapstoneWindow+Rect
        [CapstoneWindow]::GetWindowRect($handle, [ref]$capstoneCandidateRect) | Out-Null
        $capstoneCandidateArea = ($capstoneCandidateRect.Right - $capstoneCandidateRect.Left) * ($capstoneCandidateRect.Bottom - $capstoneCandidateRect.Top)
        if ($capstoneTitleBuffer.ToString() -match ' - (Google Chrome|Microsoft Edge)$' -and $capstoneCandidateArea -gt $script:capstoneArea) {
            $script:capstoneHandle = $handle
            $script:capstoneArea = $capstoneCandidateArea
            $script:capstoneTitle = $capstoneTitleBuffer.ToString()
        }
    }
    return $true
}
[CapstoneWindow]::EnumWindows($capstoneCallback, [IntPtr]::Zero) | Out-Null
if ($script:capstoneHandle -eq [IntPtr]::Zero) { throw 'No visible window belongs to the capture browser process.' }
$capstoneWorkArea = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$capstoneWidth = 1440
$capstoneHeight = 900
[CapstoneWindow]::ShowWindow($script:capstoneHandle, 9) | Out-Null
[CapstoneWindow]::SetWindowPos($script:capstoneHandle, [IntPtr](-1), 10, 10, $capstoneWidth, $capstoneHeight, 0x0040) | Out-Null
[CapstoneWindow]::SetForegroundWindow($script:capstoneHandle) | Out-Null
Start-Sleep -Milliseconds 400
$capstoneRect = New-Object CapstoneWindow+Rect
[CapstoneWindow]::GetWindowRect($script:capstoneHandle, [ref]$capstoneRect) | Out-Null
$capstoneActualWidth = $capstoneRect.Right - $capstoneRect.Left
$capstoneActualHeight = $capstoneRect.Bottom - $capstoneRect.Top
$capstoneBitmap = New-Object System.Drawing.Bitmap $capstoneActualWidth,$capstoneActualHeight
$capstoneGraphics = [System.Drawing.Graphics]::FromImage($capstoneBitmap)
$capstoneMethod = 'CopyFromScreen'
try {
    if ($capstoneRect.Right -le $capstoneWorkArea.Right -and $capstoneRect.Bottom -le $capstoneWorkArea.Bottom) {
        $capstoneGraphics.CopyFromScreen($capstoneRect.Left,$capstoneRect.Top,0,0,$capstoneBitmap.Size)
    } else {
        $capstoneMethod = 'PrintWindow'
        $capstoneHdc = $capstoneGraphics.GetHdc()
        try {
            if (-not [CapstoneWindow]::PrintWindow($script:capstoneHandle,$capstoneHdc,2)) { throw 'Native window capture failed.' }
        } finally { $capstoneGraphics.ReleaseHdc($capstoneHdc) }
    }
    $capstoneFullPath = [IO.Path]::GetFullPath($OutputPath)
    $capstoneBitmap.Save($capstoneFullPath,[System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $capstoneGraphics.Dispose()
    $capstoneBitmap.Dispose()
    [CapstoneWindow]::SetWindowPos($script:capstoneHandle, [IntPtr](-2), 0, 0, 0, 0, 0x0003) | Out-Null
}
@{file=$capstoneFullPath;width=$capstoneActualWidth;height=$capstoneActualHeight;method=$capstoneMethod;processId=$BrowserProcessId;windowTitle=$script:capstoneTitle} | ConvertTo-Json -Compress
