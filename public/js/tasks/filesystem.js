const DF_COMMAND = ['sh', ['-c', `df -h -x squashfs -x tmpfs -x devtmpfs | tail -n +2`]]
